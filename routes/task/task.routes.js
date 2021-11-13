const express = require("express");
const router = express.Router();
const {
  Task,
  TaskAttachment,
  Notification,
  TaskNotification,
  User,
  TaskComment,
  TaskCommentAttachment,
  TaskCheck,
  TaskChangeLog,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator, notificationService } = require("../../service");
const ac = require("./../../security");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT } = require("../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");

// check if user is in project?
router.get("/:projectId/tasks/", authenticateToken, async (req, res) => {
  try {
    const where = {};
    const { projectId } = req.params;

    if (projectId && projectId != "-1") where.ProjectId = projectId;

    for (const key in req.query) {
      if (req.query[key]) where[key] = req.query[key];
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
        },
        { model: User, as: "solver" },
      ],
    });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// check if user is in project?
router.get("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  try {
    const notifications = await Notification.findAll({
      where: {
        seen: 0,
        UserId: user.id,
      },
      include: [
        {
          model: TaskNotification,
          where: {
            TaskId: req.params.id,
          },
        },
      ],
    });

    // todo test
    for (let i = 0; i < notifications.length; i++) {
      notifications[i].seen = true;
      await notifications[i].save();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }

  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        // projectId: req.params.projectId,
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
      res.status(404).json({ success: false });
      return;
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:projectId/tasks/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  const io = getIo();
  const { projectId } = req.params;
  const permission = ac.can(user.role).createAny("task");
  if (!permission.granted) {
    res.status(403).json({ success: false });
    return;
  }

  const requiredAttr = ["title", "description"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }

  let data = req.body;
  data.projectId = projectId;
  data.createdById = user.id;

  try {
    const newTask = await Task.create(data);
    await TaskChangeLog.create({
      taskId: newTask.id,
      userId: user.id,
      name: "Vytvoření úkolu",
    });

    // if (req.body.solverId) {
    //   // send notification
    //   // todo pokud jsem nevypl odesilani
    //   const newNotif = await Notification.create({
    //     message: `Přiřazení k úkolu: ${newTask.title}`,
    //     userId: user.id,
    //     type: notificationType.TYPE_TASK,
    //   });
    //   const notification = await TaskNotification.create({
    //     taskId: newTask.id,
    //     notificationId: newNotif.id,
    //   });

    //   const projectUsers = await findUsersByProject(projectId);
    //   console.log("projectUsers", projectUsers);
    //   io.to(req.body.solverId).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
    //     notification,
    //   });
    // }

    const projectUsers = await findUsersByProject(projectId);
    for (const u of projectUsers) {
      io.to(u.id).emit(SOCKET_EMIT.TASK_NEW, { task: newTask });
    }

    res.json({ success: true, task: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const user = getUser(req, res);
    const permission =
      task.createdById == user.id
        ? ac.can(user.role).updateOwn("task")
        : ac.can(user.role).updateAny("task");
    if (!permission.granted) {
      res.status(403).json({ success: false });
      return;
    }

    Object.keys(req.body).forEach((key) => {
      task[key] = req.body[key];
    });

    const changedFileds = task.changed();
    if (changedFileds.length > 0) {
      changedFileds.forEach(async (field) => {
        await TaskChangeLog.create({
          taskId: req.params.id,
          userId: user.id,
          name: "Změna pole: " + field,
        });

        if (
          field === "solverId" &&
          task.solverId != null &&
          user.id != task.solverId
        ) {
          const newNotification =
            await notificationService.createTaskNotification(
              task.id,
              `Přiřazení k úkolu: ${task.title}`,
              task.solverId,
              user.id
            );
          newNotification.setDataValue("creator", user);
          newNotification.setDataValue("createdAt", new Date());
          newNotification.setDataValue("TaskNotification", { task });
          io.to(parseInt(task.solverId)).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
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
      io.to(u.id).emit(SOCKET_EMIT.TASK_EDIT, { task });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// todo delete task??? + remoev attachments
router.delete("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
  const io = getIo();
  try {
    const task = await Task.findByPk(req.params.id);
    const user = getUser(req, res);
    const permission =
      task.createdById == user.id
        ? ac.can(user.role).deleteOwn("task")
        : ac.can(user.role).deleteAny("task");
    if (!permission.granted) {
      res.status(403).json({ success: false });
      return;
    }

    await task.destroy();
    io.emit("TASK_DELETE", { id: req.params.id });
    res.json({ success: true, message: "Úkol odstraněn" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
