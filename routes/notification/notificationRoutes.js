const express = require("express");
const router = express.Router();
const {
  Notification,
  TaskNotification,
  Task,
  User
} = require("../../models/modelHelper");
const { authenticateToken, getUser } = require("./../../auth/auth");

router.get("/notifications/", authenticateToken, async (req, res) => {
  try {
    const user = getUser(req, res);
    let where = {
      userId: user.id,
    }
    if (req.query.seen != null) {
      where.seen = req.query.seen;
    }
    const records = await Notification.findAndCountAll({
      where: where,
      include: [
        {
          model: TaskNotification,
        },
        {
          model: User,
          as: 'creator',
        }
      ],
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "createdAt",
          req.query.sort ? req.query.sort : "DESC",
        ],
      ],
    });

    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/notifications/:id", async (req, res) => {
  try {
    const user = getUser(req, res);
    const notification = await Notification.findByPk(req.params.id);

    if (!notification.seen) {
      notification.seen = true;
      await notification.save();
    }

    // if (notification.type == 1) {
    //   const taskNotification = await TaskNotification.findOne({
    //     where: { NotificationId: req.params.id },
    //     include: Task,
    //   });
    //   res.json(taskNotification);
    // } else {
    //   res.json(notification);
    // }
    res.json({ success: true, message: 'Success' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// router.delete("/users/:userId/notifications/:id", async (req, res) => {
//   try {
//     const removedRecord = await Notification.remove({ id: req.params.id });
//     res.json(removedRecord);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;
