const express = require("express");
const router = express.Router();
const db = require("../../models");
const TaskChangeLog = db.TaskChangeLog;

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

module.exports = router;