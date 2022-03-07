const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const {
  Task,
  TaskAttachment,
  User,
  TaskComment,
  TaskCommentAttachment,
  TaskCheck,
  TaskChangeLog,
  Project,
  Stage,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");
const { getIo } = require("../../service/io");
const {
  SOCKET_EMIT,
  ROLE,
  TASK_PRIORITY,
  STAGE_TYPE,
} = require("../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");
const { getFullName } = require("../../service/user.service");
const sequelize = require("../../models");
const {
  sendEmailNotification,
  createTaskNotification,
} = require("../../service/notification/notification.service");
const { findOneById } = require("../../repo/user/user.repository");
const { stageRepo } = require("../../repo");
const { addTimeToDate } = require("../../service/date");
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
    const allowEntry = await isUserInProject(req.params.projectId, user.id);
    if (!allowEntry) {
      res.status(403).json({
        message: req.t("project.error.userHasNotAccessToThisProject"),
      });
      return;
    }

    const where = {};
    const { projectId } = req.params;
    const skipParams = ["offset", "limit", "orderBy", "sort"];

    if (projectId && projectId != "-1") where.ProjectId = projectId;

    for (const key in req.query) {
      if (!skipParams.includes(key) && req.query[key]) {
        if (req.query[key] === "null" || req.query[key] === "=null")
          where[key] = { [Op.is]: null };
        else if (req.query[key] === "!=null") where[key] = { [Op.ne]: null };
        else where[key] = req.query[key];
      }
    }
    console.log("where", where);
    const tasks = await Task.findAndCountAll({
      subQuery: false,
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("attachments.id")),
            "attachmentsCount",
          ],
          [
            sequelize.fn("COUNT", sequelize.col("taskComments.id")),
            "commentsCount",
          ],
        ],
      },
      where,
      include: [
        {
          model: User,
          as: "creator",
        },
        { model: User, as: "solver" },
        { model: Project, as: "project" },
        { model: TaskAttachment, as: "attachments", attributes: [] },
        { model: TaskComment, as: "taskComments", attributes: [] },
      ],
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "createdAt",
          req.query.sort ? req.query.sort : "DESC",
        ],
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
    const allowEntry = await isUserInProject(req.params.projectId, user.id);
    if (!allowEntry) {
      res.status(403).json({
        message: req.t("project.error.userHasNotAccessToThisProject"),
      });
      return;
    }

    const task = await Task.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        { model: TaskAttachment, as: "attachments" },
        { model: Task, as: "parent" },
        { model: User, as: "creator" },
        // { model: User, as: "solver" },
        {
          model: TaskComment,
          as: "taskComments",
          include: [
            { model: User, as: "taskCommentUser", required: true },
            { model: TaskCommentAttachment, as: "commentAttachments" },
          ],
        },
        { model: TaskCheck, as: "checks" },
      ],
      order: [
        [{ model: TaskComment, as: "taskComments" }, "createdAt", "DESC"],
      ],
    });

    if (task) {
      const subtasks = await Task.findAll({
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
      const logs = await TaskChangeLog.findAll({
        where: {
          taskId: req.params.taskId,
        },
        include: [{ model: User, as: "user" }],
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

  const task = Task.build({
    ...req.body,
    projectId: parseInt(projectId) || projectId,
    createdById: user.id,
  });
  console.log("task", task);

  // if (task.boardId === "null") task.boardId = null;

  try {
    if (task.boardId) {
      let firstStage = null;
      try {
        firstStage = await stageRepo.findFirstByBoard(task.boardId);
        console.log("firstStage", firstStage);
        task.stageId = firstStage?.id;
      } catch (error) {
        console.error("stageRepo.findFirstByBoard", error);
      }
    }

    const projectTasksCount = await Task.count({
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

    TaskChangeLog.create({
      taskId: newTask.id,
      userId: user.id,
      name: req.t("task.message.created"),
    });

    if (newTask.boardId) {
      const projectUsers = await findUsersByProject(projectId);
      console.log("findUsersByProject", projectUsers);

      for (const u of projectUsers) {
        console.log("send io ", SOCKET_EMIT.TASK_NEW, u.id);
        io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task: newTask });
      }
    }
    res.json({ task: newTask });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.patch("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  // await User.findByIdAndUpdate(userId, update);
  const io = getIo();
  const { projectId } = req.params;

  try {
    let task = await Task.findByPk(req.params.id);
    const taskSolverId = task.solverId;
    const user = getUser(req, res);

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
              message: req.json({
                message: req.t("error.missingPermissionForAction"),
              }),
            });
            return;
          }
        });
      }

      for (const field of changedFields) {
        console.log("changedFields", changedFields);
        if (field === "solverId") {
          const oldSolver = await User.findByPk(taskSolverId);
          const newSolver = await User.findByPk(task.solverId);

          TaskChangeLog.create({
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
            const newSolver = await User.findByPk(task.solverId);
            if (newSolver?.allowEmailNotification)
              sendEmailNotification(
                newSolver.email,
                req.t("task.newAssignment"),
                "email/task",
                "new_assignment",
                {
                  taskLink: getFeTaskUrl(task.projectId, task.id),
                  taskName: task.name,
                  username: getFullName(user),
                }
              );

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
          } else if (
            taskSolverId !== null &&
            taskSolverId !== task.solverId &&
            user.id != taskSolverId
          ) {
            if (oldSolver?.allowEmailNotification)
              sendEmailNotification(
                oldSolver.email,
                req.t("task.newAssignment"),
                "email/task",
                "removed_assignment",
                {
                  taskLink: getFeTaskUrl(task.projectId, task.id),
                  taskName: task.name,
                  username: getFullName(user),
                }
              );

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
          TaskChangeLog.create({
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
            const s = await stageRepo.findFirstByBoard(task.boardId);
            task.stageId = s.id;

            TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Změna nástěnky na ${s.name}`,
            });
          } catch (error) {
            console.error(error);
          }
        } else if (field === "stageId" && task.stageId) {
          if (task.stageId === task.previous("stageId")) continue;
          const stage = await Stage.findOne({
            subQuery: false,
            attributes: {
              include: [
                [
                  sequelize.fn("COUNT", sequelize.col("tasks.id")),
                  "tasksCount",
                ],
              ],
            },
            include: [{ model: Task, as: "tasks", attributes: [] }],
            where: {
              id: task.stageId,
            },
            group: ["tasks.id"],
          });

          if (stage.limit && stage.dataValues.tasksCount >= stage?.limit) {
            throw new ResponseError(400, req.t("error.cantAssignToStage"));
          }

          TaskChangeLog.create({
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
                  const creator = await findOneById(task.createdById);

                  if (creator && creator?.allowEmailNotification) {
                    sendEmailNotification(
                      creator.email,
                      req.t("notification.task.taskCompleted", {
                        taskName: trimString(taskName, 100),
                        userName: getFullName(user),
                      }),
                      "email/task/",
                      "completed",
                      {
                        taskLink: getFeTaskUrl(task.projectId, task.id),
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
                  const solver = await findOneById(task.solverId);

                  if (solver && solver?.allowEmailNotification) {
                    sendEmailNotification(
                      solver.email,
                      req.t("notification.task.taskCompleted", {
                        taskName,
                        userName: getFullName(user),
                      }),
                      "email/task/",
                      "completed",
                      {
                        taskLink: getFeTaskUrl(task.projectId, task.id),
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
              TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Přesunul úkol do archivu`,
              });
          } else if (field === "stageId") {
            TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Přesunul úkol do nevyřízených`,
            });
          } else if (field === "parentId") {
            if (task[field])
              TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Změnil úkol na podúkol`,
              });
            else
              TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Změnil podúkol na úkol`,
              });
          } else if (field === "deadline") {
            if (task[field])
              TaskChangeLog.create({
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
              TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Odebral ${transFields[field]} úkolu`,
              });
          } else if (field === "deletedAt") {
            TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Smazal úkol`,
            });
          } else if (field === "colorCode") {
            TaskChangeLog.create({
              taskId: req.params.id,
              userId: user.id,
              name: `Změnil ${transFields[field]} na <span style="color: ${task[field]}">${transFields[field]}</span>`,
            });
          } else if (field === "createdById") {
            const newOwner = await User.findByPk(task.field);
            if (newOwner)
              TaskChangeLog.create({
                taskId: req.params.id,
                userId: user.id,
                name: `Změnil ${transFields[field]} na ${getFullName(
                  newOwner
                )}`,
              });
            else if (field === "boardId") continue;
          } else {
            TaskChangeLog.create({
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

      await task.save();
    }

    if (task.solverId) {
      const solver = await User.findByPk(parseInt(task.solverId));
      task.setDataValue("solver", solver);
    }
    console.log("task prev vals", task.previous("stageId"));
    const projectUsers = await findUsersByProject(projectId);

    res.json({ task });

    if (changedFields.includes("boardId")) {
      if (task.boardId) {
        if (task.previous("boardId") === task.boardId) {
          for (const u of projectUsers) {
            io.to(u.id).emit(SOCKET_EMIT.TASK_EDIT, { task });
          }
        } else {
          for (const u of projectUsers) {
            io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task });
          }
        }
      } else {
        // hide task in kanban
        for (const u of projectUsers) {
          io.to(u.id).emit(SOCKET_EMIT.TASK_DELETE, { id: task.id });
        }
      }
    } else {
      for (const u of projectUsers) {
        io.to(u.id).emit(SOCKET_EMIT.TASK_EDIT, { task });
      }
    }
  } catch (error) {
    responseError(req, res, error);
  }
});

router.delete("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  const io = getIo();
  try {
    const task = await Task.findByPk(req.params.id);
    const user = getUser(req, res);

    if (
      !user.roles.includes(ROLE.ADMIN) &&
      !user.roles.includes(ROLE.MANAGEMENT) &&
      task.createdById !== user.id
    ) {
      res.status(403).json({
        message: req.json({
          message: req.t("error.missingPermissionForAction"),
        }),
      });
      return;
    }

    await task.destroy();
    res.json({ message: "Úkol odstraněn" });

    const projectUsers = await findUsersByProject(task.projectId);
    for (const u of projectUsers) {
      console.log("SOCKET TASK_DELETE to", u.id);

      io.to(u.id).emit(SOCKET_EMIT.TASK_DELETE, { id: task.id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
