const express = require("express");
const router = express.Router();
const {
  Task,
  TaskAttachment,
  Notification,
  TaskNotification,
  User, TaskComment, TaskCommentAttachment, TaskCheck
} = require("../../models/modelHelper");

// todo check if user is in project?
router.get("/:projectId/tasks/", async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        ProjectId: req.params.projectId,
      },
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });
    res.json(tasks);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/:projectId/tasks/:id", async (req, res) => {
  // try {
  //   const userId = 1; // todo
  //   const notifications = await Notification.findAll({
  //     where: {
  //       seen: 0,
  //       UserId: userId,
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

  //   notifications.forEach(async notification => {
  //     notification.seen = true;
  //     await notification.save();
  //   });
    
  // } catch (error) {
    
  // }

  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: TaskAttachment }, 
        { model: Task, as: 'subTask' },
        { model: User, as: 'creator' },
        { model: User, as: 'solver' },
        {
          model: TaskComment,
          as: 'taskComments',
          include: [
            { model: User, as: 'taskCommentUser', required: true },
            { model: TaskCommentAttachment, as: 'attachmetns', },
          ],
        },
        { model: TaskCheck },
      ],
    });

    res.json(task);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
});

router.post("/:projectId/tasks/", async (req, res) => {
  if (!req.body.title) {
    res.status(400).send({
      message: "title is required",
    });
    return;
  }

  const data = {
    title: req.body.title,
    ProjectId: req.params.projectId,
  };

  try {
    const newItem = await Task.create(data);
    res.json(newItem);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    let task = await Task.findByPk(req.params.id);

    task.title = req.body.title;
    task.description = req.body.description;
    task.status = req.body.status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.json({ message: error.message });
  }
  //console.log(task.changed())
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const removedTask = await Task.remove({ id: req.params.id });
    res.json(removedTask);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
