const express = require("express");
const router = express.Router();
const { TaskAttachment } = require("../../models/modelHelper");

router.get("/:taskId/attachments", async (req, res) => {
  try {
    const items = await TaskAttachment.findAll({
      where: {
        TaskId: req.params.taskId,
      },
    });
    res.json(items);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:taskId/attachments/:id", async (req, res) => {
  try {
    const item = await TaskAttachment.findByPk(req.params.id);
    res.json(item);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/:taskId/attachments", async (req, res) => {
  // if (!req.body.title) {
  //   res.status(400).send({
  //     message: "title is required",
  //   });
  //   return;
  // }

  //todo handle file save
  const data = {
    originalName: req.body.originalName,
    file: req.params.file,
  };

  try {
    const newItem = await TaskAttachment.create(data);
    res.send(newItem);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:taskId/attachments/:id", async (req, res) => {
  try {
    const removedItem = await TaskAttachment.remove({ id: req.params.id });
    res.json(removedItem);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
