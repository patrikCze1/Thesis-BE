const express = require("express");
const router = express.Router();
const { TaskChangeLog, User } = require("../../models/modelHelper");

router.get("/:taskId/change-logs/", async (req, res) => {
  try {
    const logs = await TaskChangeLog.findAll({
      where: {
        TaskId: req.params.taskId,
      },
      include: [
        { model: User },
      ]
    });
    res.json(logs);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
});

module.exports = router;