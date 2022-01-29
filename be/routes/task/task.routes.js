const express = require("express");
const router = express.Router();

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
const { validator, notificationService } = require("../../service");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT, ROLE, TASK_PRIORITY } = require("../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");
const { getFullName } = require("../../service/user.service");
const sequelize = require("../../models");

router.get("/:projectId/tasks/", authenticateToken, async (req, res) => {
  try {
    const where = {};
    const { projectId } = req.params;

    if (projectId && projectId != "-1") where.ProjectId = projectId;

    for (const key in req.query) {
      if (req.query[key]) where[key] = req.query[key];
    }

    const tasks = await Task.findAll({
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
      // order: [
      //   [
      //     req.query.orderBy ? req.query.orderBy : "createdAt",
      //     req.query.sort ? req.query.sort : "DESC",
      //   ],
      // ],
      group: ["Task.id"],
    });
    res.json({ tasks });
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

  const requiredAttr = ["title", "description"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).json({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }

  let data = req.body;
  data.projectId = projectId;
  data.createdById = user.id;

  try {
    const projectTasksCount = await Task.count({
      where: { projectId: projectId },
    });
    const newTask = await Task.create({
      ...data,
      number: projectTasksCount + 1,
    });
    TaskChangeLog.create({
      taskId: newTask.id,
      userId: user.id,
      name: req.t("task.message.created"),
    });

    const projectUsers = await findUsersByProject(projectId);
    for (const u of projectUsers) {
      io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task: newTask });
    }

    res.json({ task: newTask });
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
            res.status(403).json({ message: "Nedostatečné oprávnění" });
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
          const newNotification =
            await notificationService.createTaskNotification(
              task.id,
              `Uživatel ${getFullName(user)} Vás přiřadil k úkolu: ${
                task.title
              }`,
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
          const newNotification =
            await notificationService.createTaskNotification(
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
          const newNotification =
            await notificationService.createTaskNotification(
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

    const projectUsers = await findUsersByProject(projectId);
    for (const u of projectUsers) {
      if (u.id !== user.id) io.to(u.id).emit(SOCKET_EMIT.TASK_EDIT, { task });
    }

    res.json({ task });
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
      task.isCompleted = !task.isCompleted;

      await TaskChangeLog.create({
        taskId: req.params.id,
        userId: user.id,
        name:
          "Změna stavu na: " + task.isCompleted ? "dokončeno" : "nedokončeno",
      });

      if (task.isCompleted && task.createdById !== user.id) {
        const io = getIo();
        const newNotification =
          await notificationService.createTaskNotification(
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
      await task.save();

      res.json({ task });
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
      res.status(403).json({ message: "Nedostatečné oprávnění" });
      return;
    }

    await task.destroy();
    io.emit("TASK_DELETE", { id: req.params.id });
    res.json({ message: "Úkol odstraněn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
