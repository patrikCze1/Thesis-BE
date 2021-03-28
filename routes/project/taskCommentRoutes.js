const express = require("express");
const router = express.Router();
const db = require("../../models");
const {
  getUser
} = require("../../auth/auth");

const TaskComment = db.TaskComment;

router.get("/:taskId/comments/", async (req, res) => {
  try {
    const comments = await TaskComment.findAll({
      where: {
        TaskId: req.params.taskId,
      },
    });
    res.json(comments);
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

  const data = {
    text: req.body.text,
    TaskId: req.params.taskId,
    UserId: getUser(),
  };

  try {
    const newItem = await TaskComment.create(data);
    res.send(newItem);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;