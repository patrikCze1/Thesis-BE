const express = require("express");
const router = express.Router();

const {
  Notification,
  TaskNotification,
  Task,
  User,
} = require("../../models/modelHelper");
const { authenticateToken, getUser } = require("../../auth/auth");
const { getIo } = require("../../service/io");

router.get("/", authenticateToken, async (req, res) => {
  const io = getIo();
  // console.log("io", io);
  try {
    const user = getUser(req, res);
    let where = {
      userId: user.id,
    };
    if (req.query.seen != null) {
      where.seen = req.query.seen;
    }
    const records = await Notification.findAndCountAll({
      where: where,
      include: [
        {
          model: TaskNotification,
          include: [{ model: Task, as: "task" }],
        },
        {
          model: User,
          as: "creator",
        },
      ],
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "createdAt",
          req.query.sort ? req.query.sort : "DESC",
        ],
      ],
    });

    // for (const socket of io.sockets.sockets) {
    //   console.log("socket", socket);
    //   // socket.broadcast.to(socketid).emit('message', 'for your eyes only');
    // }
    io.to(1).emit("test", "test");

    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id/seen", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification.seen) notification.seen = true;
    else notification.seen = false;

    await notification.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/see-all", authenticateToken, async (req, res) => {
  try {
    const user = getUser(req, res);
    await Notification.update({ seen: true }, { where: { userId: user.id } });

    res.json();
  } catch (error) {
    res.status(500).json({ message: error.message });
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
