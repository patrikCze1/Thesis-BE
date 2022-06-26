const express = require("express");
const router = express.Router();
const { Op, literal, fn, col } = require("sequelize");

const {
  getUser,
  authenticateToken,
  getCompanyKey,
} = require("../../auth/auth");
const { validator } = require("../../service");
const { getIo } = require("../../service/io");
const {
  SOCKET_EMIT,
  ROLE,
  TASK_PRIORITY,
  STAGE_TYPE,
} = require("../../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");
const { getFullName } = require("../../service/user.service");
const { getDatabaseModels, getDatabaseConnection } = require("../../models");
const {
  sendEmailNotification,
  createTaskNotification,
} = require("../../service/notification/notification.service");
const { stageRepo } = require("../../repo");
const {
  getFeTaskUrl,
  trimString,
  responseError,
} = require("../../service/utils");
const ResponseError = require("../../models/common/ResponseError");
const { isUserInProject } = require("../../repo/project/project.repository");

router.get("/:projectId/tasks/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const where = {};
    const { projectId } = req.params;
    const skipParams = ["offset", "limit", "orderBy", "sort"];

    if (projectId && projectId != "-1") {
      where.ProjectId = projectId;
      const allowEntry = await isUserInProject(
        db,
        req.params.projectId,
        user.id
      );
      if (!allowEntry && !user.roles.includes(ROLE.ADMIN)) {
        res.status(403).json({
          message: req.t("project.error.userHasNotAccessToThisProject"),
        });
        return;
      }
    }

    for (const key in req.query) {
      if (!skipParams.includes(key) && req.query[key]) {
        if (req.query[key] === "null" || req.query[key] === "=null")
          where[key] = { [Op.is]: null };
        else if (req.query[key] === "!=null") where[key] = { [Op.ne]: null };
        else if (req.query[key] === "true") where[key] = true;
        else if (req.query[key] === "false") where[key] = false;
        else where[key] = req.query[key];
      }
    }

    console.log("where", where);
    const tasks = await db.Task.findAndCountAll({
      subQuery: false,
      attributes: {
        include: [
          [literal("COUNT(DISTINCT attachments.id)"), "attachmentsCount"],
          [literal("COUNT(DISTINCT taskComments.id)"), "commentsCount"],
        ],
      },
      where,
      include: [
        {
          model: db.User,
          as: "creator",
        },
        { model: db.User, as: "solver" },
        { model: db.Project, as: "project" },
        {
          model: db.TaskAttachment,
          as: "attachments",
          attributes: [],
        },
        { model: db.TaskComment, as: "taskComments", attributes: [] },
      ],
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      order: [
        ["priority", "DESC"],
        ["estimation", "desc"],
      ],
      group: ["Task.id"],
    });

    res.json({ rows: tasks.rows, count: tasks.count?.length || 0 }); //sequelize bug
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// check if user is in project?
router.get("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  // try {
  //   const notifications = await Notification.findAll({
  //     where: {
  //       seen: 0,
  //       UserId: user.id,
  //     },
  //     include: [
  //       {
  //         model: TaskNotification,
  //         where: {
  //           TaskId: req.params.id,
  //         },
  //       },
  //     ],
  //   });

  //   // todo test
  //   for (let i = 0; i < notifications.length; i++) {
  //     notifications[i].seen = true;
  //     await notifications[i].save();
  //   }
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  //   return;
  // }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const allowEntry = await isUserInProject(db, req.params.projectId, user.id);
    if (!allowEntry && !user.roles.includes(ROLE.ADMIN)) {
      res.status(403).json({
        message: req.t("project.error.userHasNotAccessToThisProject"),
      });
      return;
    }

    const task = await db.Task.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        { model: db.TaskAttachment, as: "attachments" },
        { model: db.Task, as: "parent" },
        { model: db.User, as: "creator" },
        // { model: User, as: "solver" },
        {
          model: db.TaskComment,
          as: "taskComments",
          include: [
            { model: db.User, as: "taskCommentUser", required: true },
            { model: db.TaskCommentAttachment, as: "commentAttachments" },
          ],
        },
        { model: db.TaskCheck, as: "checks" },
      ],
      order: [
        [{ model: db.TaskComment, as: "taskComments" }, "createdAt", "DESC"],
      ],
    });

    if (task) {
      const subtasks = await db.Task.findAll({
        where: {
          parentId: req.params.id,
        },
      });
      task.setDataValue("subtasks", subtasks); // assign subtasks
    } else {
      res.status(404).json();
      return;
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/:projectId/tasks/:taskId/change-logs/",
  authenticateToken,
  async (req, res) => {
    try {
      const ck = getCompanyKey(req);
      const db = getDatabaseModels(ck);
      const logs = await db.TaskChangeLog.findAll({
        where: {
          taskId: req.params.taskId,
        },
        include: [{ model: db.User, as: "user" }],
      });
      res.json({ logs });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post("/:projectId/tasks/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  const io = getIo();
  const { projectId } = req.params;

  const requiredAttr = ["name"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).json({
      message:
        `${req.t("error.thisFieldsAreRequired")}: ` +
        result.requiredFields
          .map((field) => req.t(`field.${field}`))
          .join(", "),
    });
    return;
  }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);

    const task = db.Task.build({
      ...req.body,
      projectId: parseInt(projectId) || projectId,
      createdById: user.id,
    });
    console.log("task", task);

    // if (task.boardId === "null") task.boardId = null;

    if (task.boardId) {
      let firstStage = null;
      try {
        firstStage = await stageRepo.findFirstByBoard(db, task.boardId);
        console.log("firstStage", firstStage);
        task.stageId = firstStage?.id;
      } catch (error) {
        console.error("stageRepo.findFirstByBoard", error);
      }
    }

    const projectTasksCount = await db.Task.count({
      where: { projectId: projectId },
      paranoid: false,
    });
    task.number = projectTasksCount + 1;
    // const newTask = await Task.create({
    //   ...data,
    //   number: projectTasksCount + 1,
    // });
    const newTask = await task.save();

    newTask.setDataValue("createdAt", new Date());
    newTask.setDataValue("updatedAt", new Date());

    db.TaskChangeLog.create({
      taskId: newTask.id,
      userId: user.id,
      name: req.t("task.message.created"),
    });

    // if (newTask.boardId) {
    const conn = getDatabaseConnection(ck);
    const projectUsers = await findUsersByProject(conn, projectId);
    console.log("findUsersByProject", projectUsers);

    for (const u of projectUsers) {
      console.log("send io ", SOCKET_EMIT.TASK_NEW, u.id);
      io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task: newTask });
    }
    // }
    res.json({ task: newTask });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.patch("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  // await User.findByIdAndUpdate(userId, update);
  const io = getIo();
  const { projectId } = req.params;
  let prevBoardId = null;
  let prevWasArchived = false;

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    let task = await db.Task.findByPk(req.params.id);
    const taskSolverId = task.solverId;
    const user = getUser(req, res);
    prevBoardId = task.boardId;

    Object.keys(req.body).forEach((key) => {
      task[key] = req.body[key];
    });

    const changedFields = task.changed();
    if (typeof changedFields === "boolean" && changedFields === false) {
      res.json({ task });
      return;
    }

    if (changedFields.length > 0) {
      if (
        !user.roles.includes(ROLE.ADMIN) &&
        !user.roles.includes(ROLE.MANAGEMENT) &&
        task.createdById !== user.id
      ) {
        changedFields.forEach((field) => {
          if (
            [
              "createdById",
              "priority",
              "deadline",
              "parentId",
              "name",
              "description",
            ].includes(field)
          ) {
            res.status(403).json({
              message: req.t("error.missingPermissionForAction"),
            });
            return;
          }
        });
      }

      for (const field of changedFields) {
        console.log("changedFields", changedFields);
        console.log("task", task);
        if (field === "solverId") {
          const oldSolver = await db.User.findByPk(taskSolverId);
          const newSolver = await db.User.findByPk(task.solverId);

          await db.TaskChangeLog.create({
            taskId: req.params.id,
            userId: user.id,
            name: `Změnil řešitele z ${
              oldSolver ? getFullName(oldSolver) : "nikdo"
            } na ${newSolver ? getFullName(newSolver) : "nikdo"}`,
          });

          if (
            (taskSolverId === null || taskSolverId !== task.solverId) &&
            task.solverId != null &&
            user.id != task.solverId
          ) {
            const newSolver = await db.User.findByPk(task.solverId);
            if (newSolver?.allowEmailNotification) {
              sendEmailNotification(
                newSolver.email,
                req.t("task.message.newAssignment"),
                "src/email/task",
                "new_assignment",
                {
                  taskLink: getFeTaskUrl(task),
                  taskName: task.name,
                  username: getFullName(user),
                }
              );
            }

            const newNotification = await createTaskNotification(
              task.id,
              `Uživatel ${getFullName(
                user
              )} Vás přiřadil/a k úkolu: ${trimString(task.name, 100)}`,
              task.solverId,
              user.id
            );
            newNotification.setDataValue("creator", user);
            newNotification.setDataValue("createdAt", new Date());
            newNotification.setDataValue("TaskNotification", { task });
            io.to(parseInt(task.solverId)).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
              notification: newNotification,
            });
            console.log("io to ", task.solverId);
          } else if (
            taskSolverId !== null &&
            taskSolverId !== task.solverId &&
            user.id != taskSolverId
          ) {
            if (oldSolver?.allowEmailNotification) {
              sendEmailNotification(
                oldSolver.email,
                req.t("task.message.newAssignment"),
                "src/email/task",
                "removed_assignment",
                {
                  taskLink: getFeTaskUrl(task),
                  taskName: task.name,
                  username: getFullName(user),
                }
              );
            }

            const newNotification = await createTaskNotification(
              task.id,
              `${getFullName(user)} Vám odebral/a úkol: ${trimString(
                task.name,
                100
              )}`,
              taskSolverId,
              user.id
            );
            newNotification.setDataValue("creator", user);
            newNotification.setDataValue("createdAt", new Date());
            newNotification.setDataValue("TaskNotification", { task });
            io.to(taskSolverId).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
              notification: newNotification,
            });
          }
        } else if (field === "priority") {
          await db.TaskChangeLog.create({
            taskId: req.params.id,
            userId: user.id,
            name: `Změnil prioritu na ${TASK_PRIORITY[task.priority]}`,
          });

          if (user.id != taskSolverId) {
            const newNotification = await createTaskNotification(
              task.id,
              `${getFullName(user)} změnil/a prioritu úkolu: ${trimString(
                task.name,
                100
              )} na ${TASK_PRIORITY[task.priority]}`,
              taskSolverId,
              user.id
            );
            newNotification.setDataValue("creator", user);
            newNotification.setDataValue("createdAt", new Date());
            newNotification.setDataValue("TaskNotification", { task });
            io.to(taskSolverId).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
              notification: newNotification,
            });
          }
        } else if (field === "boardId" && task.boardId && !task.stageId) {
          try {
            const s = await stageRepo.findFirstByBoard(db, task.boardId);
            task.stageId = s.id;
            await db.TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Změna nástěnky na ${s.name}`,
            });
          } catch (error) {
            console.error(error);
          }
        } else if (field === "stageId" && task.stageId) {
          if (task.stageId === task.previous("stageId")) continue;
          const stage = await db.Stage.findOne({
            subQuery: false,
            attributes: {
              include: [[fn("COUNT", col("tasks.id")), "tasksCount"]],
            },
            include: [{ model: db.Task, as: "tasks", attributes: [] }],
            where: {
              id: task.stageId,
            },
            group: ["tasks.id"],
          });

          if (stage.limit && stage.dataValues.tasksCount >= stage?.limit) {
            throw new ResponseError(400, req.t("error.cantAssignToStage"));
          }

          await db.TaskChangeLog.create({
            taskId: req.params.id,
            userId: user.id,
            name: req.t(`task.message.stageChangedTo`, {
              stage: stage.name,
            }),
          });

          if (stage.type === STAGE_TYPE.COMPLETED && !task.completedAt) {
            task.completedAt = new Date();

            if (
              (task.completedAt && task.createdById !== user.id) ||
              task.solverId !== user.id
            ) {
              try {
                const taskName = `[${task.number}] ${task.name}`;

                if (task.createdById !== user.id) {
                  const creator = await db.User.findByPk(task.createdById);

                  if (creator && creator?.allowEmailNotification) {
                    sendEmailNotification(
                      creator.email,
                      req.t("notification.task.taskCompleted", {
                        taskName: trimString(taskName, 100),
                        userName: getFullName(user),
                      }),
                      "src/email/task/",
                      "completed",
                      {
                        taskLink: getFeTaskUrl(task),
                        username: getFullName(user),
                        taskName,
                      }
                    );
                  }

                  const newNotification = await createTaskNotification(
                    task.id,
                    `Uživatel ${getFullName(user)} dokončil úkol: ${trimString(
                      task.name,
                      100
                    )}`,
                    task.createdById,
                    user.id
                  );

                  newNotification.setDataValue("creator", user);
                  newNotification.setDataValue("createdAt", new Date());
                  newNotification.setDataValue("TaskNotification", { task });

                  io.to(task.createdById).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
                    notification: newNotification,
                  });
                }

                if (
                  task.solverId &&
                  task.solverId !== user.id &&
                  task.solverId !== task.createdById
                ) {
                  const solver = await db.User.findByPk(task.solverId);

                  if (solver && solver?.allowEmailNotification) {
                    sendEmailNotification(
                      solver.email,
                      req.t("notification.task.taskCompleted", {
                        taskName,
                        userName: getFullName(user),
                      }),
                      "src/email/task/",
                      "completed",
                      {
                        taskLink: getFeTaskUrl(task),
                        username: getFullName(user),
                        taskName,
                      }
                    );
                  }
                  const newNotification = await createTaskNotification(
                    task.id,
                    `Uživatel ${getFullName(user)} dokončil úkol: ${trimString(
                      task.name,
                      100
                    )}`,
                    task.solverId,
                    user.id
                  );

                  newNotification.setDataValue("creator", user);
                  newNotification.setDataValue("createdAt", new Date());
                  newNotification.setDataValue("TaskNotification", { task });

                  io.to(task.solverId).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
                    notification: newNotification,
                  });
                }
              } catch (error) {
                console.error(error);
              }
            }
          } else if (stage.type !== STAGE_TYPE.COMPLETED && task.completedAt) {
            task.completedAt = null;
          }
        } else {
          const transFields = {
            name: req.t("field.task.name"),
            description: req.t("field.task.description"),
            // priority: req.t('field.task.priority'),
            // projectId: req.t('field.task.projectId'),
            // parentId: req.t('field.task.parentId'),
            deadline: req.t("field.task.deadline"),
            colorCode: req.t("field.task.colorCode"),
            estimaiton: req.t("field.task.estimaiton"),
            createdById: req.t("field.task.createdById"),
            // archived: req.t('field.task.archived'),
            // completedAt: req.t('field.task.completedAt'), // stageId
            // deletedAt: req.t('field.task.deletedAt'),
          };

          if (field === "archived") {
            if (task[field] == true)
              db.TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Přesunul úkol do archivu`,
              });
          } else if (field === "stageId") {
            db.TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Přesunul úkol do nevyřízených`,
            });
          } else if (field === "parentId") {
            if (task[field])
              db.TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Změnil úkol na podúkol`,
              });
            else
              db.TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Změnil podúkol na úkol`,
              });
          } else if (field === "deadline") {
            if (task[field])
              db.TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Změnil ${
                  transFields[field]
                } na ${new Intl.DateTimeFormat("default", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(task[field])}`,
              });
            else
              db.TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Odebral ${transFields[field]} úkolu`,
              });
          } else if (field === "deletedAt") {
            db.TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Smazal úkol`,
            });
          } else if (field === "colorCode") {
            db.TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Změnil ${transFields[field]} na <span style="color: ${task[field]}">${transFields[field]}</span>`,
            });
          } else if (field === "createdById") {
            const newOwner = await db.User.findByPk(task.field);
            if (newOwner)
              db.TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Změnil ${transFields[field]} na ${getFullName(
                  newOwner
                )}`,
              });
            else if (field === "boardId") continue;
          } else if (!["boardId", "stageId"].includes(field)) {
            await db.TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Změnil ${transFields[field]} na ${trimString(
                task[field],
                100
              )}`,
            });
          }
        }
      }
      prevWasArchived = task.previous("archived");
      await task.save();
    }

    if (task.solverId) {
      const solver = await db.User.findByPk(parseInt(task.solverId));
      task.setDataValue("solver", solver);
    }
    console.log("task prev vals", task.previous("stageId"));
    const conn = getDatabaseConnection(ck);
    const projectUsers = await findUsersByProject(conn, projectId);

    console.log("prevWasArchived", prevWasArchived);
    if (changedFields.includes("boardId")) {
      if (task.boardId) {
        if (prevBoardId == task.boardId) {
          console.log("prevBoardId === task.boardId", prevBoardId);
          for (const u of projectUsers) {
            io.to(u.id).emit(SOCKET_EMIT.TASK_EDIT, { task });
          }
        } else if (task.archived !== prevWasArchived) {
          // move from archive to kanban
          for (const u of projectUsers) {
            io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task });
          }
        } else {
          // move from backlog to kanban
          console.log("else");
          for (const u of projectUsers) {
            io.to(u.id).emit(SOCKET_EMIT.TASK_DELETE, {
              id: task.id,
              type: "rmFromBacklog",
            });
            io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task });
          }
        }
      } else {
        console.log("!task.boardId");
        // hide task in kanban, move them to backlog
        for (const u of projectUsers) {
          io.to(u.id).emit(SOCKET_EMIT.TASK_DELETE, {
            id: task.id,
            type: "rmFromKanban",
          });
          // todo io.backlog task new
        }
      }
    } else if (changedFields.includes("archived")) {
      if (prevWasArchived && task.boardId) {
        // move from archive to kanban
        for (const u of projectUsers) {
          io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task });
        }
        //  } else if (prevWasArchived && !task.boardId) {// move from archive to backlog
      } else {
        for (const u of projectUsers) {
          io.to(u.id).emit(SOCKET_EMIT.TASK_DELETE, {
            id: task.id,
            type: "rmFromKanban",
          });
        }
      }
    } else {
      console.log("SOCKET_EMIT.TASK_EDIT");
      for (const u of projectUsers) {
        console.log("SOCKET_EMIT.TASK_EDIT ", u.id);
        io.to(u.id).emit(SOCKET_EMIT.TASK_EDIT, { task });
      }
    }

    res.json({ task });
  } catch (error) {
    console.error("path", error);
    responseError(req, res, error);
  }
});

router.delete("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  const io = getIo();
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const task = await db.Task.findByPk(req.params.id);
    const user = getUser(req, res);

    if (
      !user.roles.includes(ROLE.ADMIN) &&
      !user.roles.includes(ROLE.MANAGEMENT) &&
      task.createdById !== user.id
    ) {
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }

    await task.destroy();
    res.json({ message: req.t("task.message.deleted") });

    const conn = getDatabaseConnection(ck);
    const projectUsers = await findUsersByProject(conn, task.projectId);
    for (const u of projectUsers) {
      io.to(u.id).emit(SOCKET_EMIT.TASK_DELETE, {
        id: task.id,
        type: "rmFromAll",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
