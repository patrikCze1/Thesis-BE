const express = require("express");
const router = express.Router();
const {
  Notification,
  TaskNotification,
  Task,
} = require("../../models/modelHelper");

router.get("/users/:userId/notifications/", async (req, res) => {
  try {
    const records = await Notification.findAll({
      where: {
        userId: req.params.userId,
      },
      include: TaskNotification,
    });
    res.json(records);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/users/:userId/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification.seen) {
      notification.seen = true;
      await notification.save();
    }

    if (notification.type == 1) {
      const taskNotification = await TaskNotification.findOne({
        where: { NotificationId: req.params.id },
        include: Task,
      });
      res.json(taskNotification);
    } else {
      res.json(notification);
    }
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/users/:userId/notifications/:id", async (req, res) => {
  try {
    const removedRecord = await Notification.remove({ id: req.params.id });
    res.json(removedRecord);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
