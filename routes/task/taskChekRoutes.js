const express = require("express");
const router = express.Router();
const { Task, SubTask } = require("../../models/modelHelper");

router.get("/:taskId/subtasks/", async (req, res) => {
  try {
    const records = await SubTask.findAll({
      where: {
        TaskId: req.params.taskId,
      },
    });
    res.json(records);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:taskId/subtasks/:id", async (req, res) => {
  try {
    const subTask = await SubTask.findByPk(req.params.id);

    res.json(subTask);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/:taskId/subtasks", async (req, res) => {
  //todo validate

  const data = {
    title: req.body.title,
    TaskId: req.params.taskId,
  };

  try {
    const newItem = await SubTask.create(data);
    res.send(newItem);
  } catch (error) {
    res.json({ message: error });
  }
});

router.patch("/:taskId/subtasks/:id", async (req, res) => {
  try {
    let record = await SubTask.findByPk(req.params.id);
    
    record.title = req.body.title;
    record.solvedById = req.body.solvedById;
    record.completed = req.body.completed;
    await record.save();

    res.json(record);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:taskId/subtasks/:id", async (req, res) => {
  try {
    const removedRecord = await SubTask.remove({ id: req.params.id });
    res.json(removedRecord);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
