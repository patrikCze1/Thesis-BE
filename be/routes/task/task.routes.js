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
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT, ROLE, TASK_PRIORITY } = require("../../enum/enum");
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
const { getFeTaskUrl } = require("../../service/utils");

router.get("/:projectId/tasks/", authenticateToken, async (req, res) => {
  try {
    const where = {};
    const { projectId } = req.params;
    const skipParams = ["offset", "archive", "limit"];

    if (projectId && projectId != "-1") where.ProjectId = projectId;
    if (req.query.archive) {
      if (req.query.archive === "true")
        where.completedAt = { [Op.lt]: addTimeToDate(new Date(), -86400 * 7) };
      else
        where.completedAt = {
          [Op.or]: [
            { [Op.gt]: addTimeToDate(new Date(), -86400 * 7) },
            { [Op.is]: null },
          ],
        };
    }

    for (const key in req.query) {
      if (!skipParams.includes(key) && req.query[key]) {
        if (req.query[key] === "null") where[key] = { [Op.is]: null };
        else where[key] = req.query[key];
      }
    }

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
    const task = await Task.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        { model: TaskAttachment, as: "attachments" },
        { model: Task, as: "parentTask" },
        { model: User, as: "creator" },
        { model: User, as: "solver" },
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

  const requiredAttr = ["title"];
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

  const data = req.body;
  data.projectId = parseInt(projectId) || projectId;
  data.createdById = user.id;

  try {
    let firstStage = null;
    try {
      firstStage = await stageRepo.findFirstByBoard(req.body.boardId);
      console.log("firstStage", firstStage);
      data.stageId = firstStage?.id;
    } catch (error) {
      console.error("stageRepo.findFirstByBoard", error);
    }

    const projectTasksCount = await Task.count({
      where: { projectId: projectId },
      paranoid: false,
    });
    const newTask = await Task.create({
      ...data,
      number: projectTasksCount + 1,
    });
    newTask.setDataValue("createdAt", new Date());
    newTask.setDataValue("updatedAt", new Date());
    res.json({ task: newTask });

    TaskChangeLog.create({
      taskId: newTask.id,
      userId: user.id,
      name: req.t("task.message.created"),
    });

    const projectUsers = await findUsersByProject(projectId);
    console.log("findUsersByProject", projectUsers);
    for (const u of projectUsers) {
      console.log("send io ", SOCKET_EMIT.TASK_NEW, u.id);
      // if (user.id !== u.id)
      io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task: newTask });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  // const update = req.body
  // const userId = req.params.userId;
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

    const changedFileds = task.changed();
    console.log("changed fields: ", changedFileds);
    if (changedFileds.length > 0) {
      if (
        !user.roles.includes(ROLE.ADMIN) &&
        !user.roles.includes(ROLE.MANAGEMENT) &&
        task.createdById !== user.id
      ) {
        changedFileds.forEach((field) => {
          if (
            [
              "createdById",
              "priority",
              "deadline",
              "parentId",
              "title",
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

      changedFileds.forEach(async (field) => {
        await TaskChangeLog.create({
          taskId: req.params.id,
          userId: user.id,
          name: `Změna pole: ${field}`,
        });

        if (
          field === "solverId" &&
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
                taskName: task.title,
                username: getFullName(user),
              }
            );

          const newNotification = await createTaskNotification(
            task.id,
            `Uživatel ${getFullName(user)} Vás přiřadil k úkolu: ${task.title}`,
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
          field === "solverId" &&
          taskSolverId !== null &&
          taskSolverId !== task.solverId &&
          user.id != taskSolverId
        ) {
          const oldSolver = await User.findByPk(taskSolverId);
          if (oldSolver?.allowEmailNotification)
            sendEmailNotification(
              oldSolver.email,
              req.t("task.newAssignment"),
              "email/task",
              "removed_assignment",
              {
                taskLink: getFeTaskUrl(task.projectId, task.id),
                taskName: task.title,
                username: getFullName(user),
              }
            );

          const newNotification = await createTaskNotification(
            task.id,
            `Uživatel ${getFullName(user)} Vám odebral úkol: ${task.title}`,
            taskSolverId,
            user.id
          );
          newNotification.setDataValue("creator", user);
          newNotification.setDataValue("createdAt", new Date());
          newNotification.setDataValue("TaskNotification", { task });
          io.to(taskSolverId).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
            notification: newNotification,
          });
        } else if (field === "priority" && user.id != taskSolverId) {
          const newNotification = await createTaskNotification(
            task.id,
            `Uživatel ${getFullName(user)} změnil prioritu úkolu: ${
              task.title
            } na ${TASK_PRIORITY[task.priority]}`,
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
      });

      await task.save();
    }

    if (task.solverId) {
      const solver = await User.findByPk(parseInt(task.solverId));
      task.setDataValue("solver", solver);
    }
    res.json({ task });

    const projectUsers = await findUsersByProject(projectId);
    for (const u of projectUsers) {
      if (u.id !== user.id) io.to(u.id).emit(SOCKET_EMIT.TASK_EDIT, { task });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch(
  "/:projectId/tasks/:id/complete",
  authenticateToken,
  async (req, res) => {
    const user = getUser(req, res);

    try {
      const task = await Task.findByPk(req.params.id);
      if (task.completedAt) task.completedAt = null;
      else task.completedAt = new Date();

      await task.save();
      res.json({ task });

      TaskChangeLog.create({
        taskId: req.params.id,
        userId: user.id,
        name:
          "Změna stavu na: " + task.completedAt ? "dokončeno" : "nedokončeno",
      });

      if (
        (task.completedAt && task.createdById !== user.id) ||
        task.solverId !== user.id
      ) {
        try {
          const io = getIo();
          const taskName = `[${task.number}] ${task.title}`;

          if (task.createdById !== user.id) {
            const creator = await findOneById(task.createdById);

            if (creator && creator?.allowEmailNotification) {
              sendEmailNotification(
                creator.email,
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
              `Uživatel ${getFullName(user)} dokončil úkol: ${task.title}`,
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
              `Uživatel ${getFullName(user)} dokončil úkol: ${task.title}`,
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

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
      // if (u.id !== user.id)
      io.to(u.id).emit("TASK_DELETE", { id: task.id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
