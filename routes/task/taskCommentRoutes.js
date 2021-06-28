const express = require("express");
const router = express.Router();
const { TaskComment, TaskCommentAttachment, User } = require("../../models/modelHelper");
const {
  getUser, authenticateToken
} = require("../../auth/auth");
const { validator } = require('../../service');

router.post("/:taskId/comments/", authenticateToken, async (req, res) => {
  const requiredAttr = ['text'];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(', '),
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
    TaskId: req.body.taskId,
    UserId: getUser().id,
  };

  try {
    const newItem = await TaskComment.create(data);
    res.send(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:taskId/comments/:id", authenticateToken, async (req, res) => {
  try {

    let taskComment = await TaskComment.findByPk(req.params.id);
    
    task.text = req.body.text;
    await taskComment.save();

    res.json(taskComment);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.delete("/:taskId/comments/:id", authenticateToken, async (req, res) => {
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