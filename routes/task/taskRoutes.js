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
const { notificationType } = require("./../../models/constantHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator, notificationService } = require("../../service");
const ac = require("./../../security");

// check if user is in project?
router.get("/:projectId/tasks/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        ProjectId: req.params.projectId,
      },
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
  data.projectId = req.params.projectId;
  data.createdById = user.id;

  try {
    const newTask = await Task.create(data);
    await TaskChangeLog.create({
      taskId: newTask.id,
      userId: user.id,
      name: "Vytvoření úkolu",
    });

    if (req.body.solverId) {
      // send notification
      // todo pokud jsem nevypl odesilani
      const newNotif = await Notification.create({
        message: `Přiřazení k úkolu: ${newTask.title}`,
        userId: user.id,
        type: notificationType.TYPE_TASK,
      });
      await TaskNotification.create({
        taskId: newTask.id,
        notificationId: newNotif.id,
      });
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
          user.id !== task.solverId
        ) {
          notificationService.createTaskNotification(
            task.id,
            `Přiřazení k úkolu: ${task.title}`,
            task.solverId,
            user.id
          );
        }
      });

      await task.save();
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// todo delete task??? + remoev attachments
router.delete("/:projectId/tasks/:id", authenticateToken, async (req, res) => {
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
    res.json({ success: true, message: "Úkol odstraněn" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
