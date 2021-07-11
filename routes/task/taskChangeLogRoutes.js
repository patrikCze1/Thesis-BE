const express = require("express");
const router = express.Router();
const { TaskChangeLog, User } = require("../../models/modelHelper");
const { authenticateToken } = require("../../auth/auth");

router.get("/:taskId/change-logs/", authenticateToken, async (req, res) => {
  try {
    const logs = await TaskChangeLog.findAll({
      where: {
        TaskId: req.params.taskId,
      },
      include: [
        { model: User, as: 'user' },
      ]
    });
    res.json({ succes: true, logs});
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
});

module.exports = router;