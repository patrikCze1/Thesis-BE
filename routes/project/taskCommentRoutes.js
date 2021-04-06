const express = require("express");
const router = express.Router();
const TaskComment = require("../../models/modelHelper");
const {
  getUser
} = require("../../auth/auth");

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

router.get("/:taskId/comments/:id", async (req, res) => {
  try {
    const comment = await TaskComment.findByPk({
      where: {
        TaskId: req.params.taskId,
        id: req.params.id,
      },
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

  const data = {
    text: req.body.text,
    TaskId: req.params.taskId,
    UserId: getUser().id,
  };

  try {
    const newItem = await TaskComment.create(data);
    res.send(newItem);
  } catch (error) {
    res.json({ message: error });
  }
});

router.patch("/:taskId/comments/:id", async (req, res) => {
  try {
    let taskComment = await TaskComment.findByPk(req.params.id);
    
    task.text = req.body.text;
    await taskComment.save();

    res.json(taskComment);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:taskId/comments/:id", async (req, res) => {
  try {
    const removedRow = await TaskComment.remove({ id: req.params.id });
    res.json(removedRow);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;