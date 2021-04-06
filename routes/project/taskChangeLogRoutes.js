const express = require("express");
const router = express.Router();
const TaskChangeLog = require("../../models/modelHelper");

router.get("/:taskId/change-logs/", async (req, res) => {
  try {
    const logs = await TaskChangeLog.findAll({
      where: {
        TaskId: req.params.taskId,
      },
    });
    res.json(logs);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:taskId/change-logs/:id", async (req, res) => {
  try {
    res.json(await TaskChangeLog.findByPk(req.params.id));
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removedRow = await Todo.remove({ id: req.params.id });
    res.json(removedRow);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;