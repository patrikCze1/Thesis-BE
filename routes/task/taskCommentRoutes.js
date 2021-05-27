const express = require("express");
const router = express.Router();
const { TaskComment, TaskCommentAttachment, User } = require("../../models/modelHelper");
const {
  getUser
} = require("../../auth/auth");

router.get("/:taskId/comments/", async (req, res) => {
  try {
    const comments = await TaskComment.findAll({
      where: {
        TaskId: req.params.taskId,
      },
      include: [
        {model: TaskCommentAttachment},
        {model: User, as: 'user'},
      ],
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 1,
      order: [
        [
          "createdAt",
          "DESC",
        ],
      ],
    });
    res.json(comments);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/:taskId/comments/:id", async (req, res) => {
  try {
    const comment = await TaskComment.findByPk({
      where: {
        TaskId: req.params.taskId,
        id: req.params.id,
      },
      include: TaskCommentAttachment,
    });
    res.json(comment);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/:taskId/comments/", async (req, res) => {
  if (!req.body.text) {
    res.status(400).send({
      message: "text is required",
    });
    return;
  }

  // send notification
  // todo pokud jsem nevypl odesilani
  const newNotif = await Notification.create({
    message: 'ahoj',
    type: 1,
  });
  await TaskNotification.create({
    TaskId: req.params.id,
    NotificationId: newNotif.id,
  });

  const data = {
    text: req.body.text,
    TaskId: req.params.taskId,
    UserId: getUser().id,
  };

  try {
    const newItem = await TaskComment.create(data);
    res.send(newItem);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.patch("/:taskId/comments/:id", async (req, res) => {
  try {
    let taskComment = await TaskComment.findByPk(req.params.id);
    
    task.text = req.body.text;
    await taskComment.save();

    res.json(taskComment);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.delete("/:taskId/comments/:id", async (req, res) => {
  //todo remove all task comment attach
  try {
    const attachments = await TaskCommentAttachment.findAll({
      where: {
        TaskCommentId: req.params.id,
      },
    });
    attachments.forEach(attachment => {
      //remove
      //await TaskCommentAttachment.remove({ id: attachment.id });
    });

    const removedRow = await TaskComment.remove({ id: req.params.id });
    res.json(removedRow);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;