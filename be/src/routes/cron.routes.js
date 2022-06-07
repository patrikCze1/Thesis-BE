const express = require("express");
const { SOCKET_EMIT } = require("../../enum/enum");
const router = express.Router();

const { Todo } = require("../models/modelHelper");
const { getIo } = require("../service/io");
const {
  createTaskNotification,
} = require("../service/notification/notification.service");
const { responseError, trimString } = require("../service/utils");
const { taskRepo } = require("./../repo");

router.get("/daily", async (req, res) => {
  if (!req.query.token && req.query.token !== "1234") {
    res.status(403).json({
      message: "Invalid token",
    });
    return;
  }

  try {
    const io = getIo();
    const tasks = await taskRepo.findTasksWithDeadlineIn24h();

    for (const task of tasks) {
      console.log(task.id);

      if (task.solverId) {
        const n = await createTaskNotification(
          task.id,
          `Úkol ${trimString(task.name, 100)} má být brzy dokončen`,
          // req.t("task.message.deadlineIn24Hours", {
          //   name: trimString(task.name, 100),
          // }),
          task.solverId,
          null
        );
        n.setDataValue("createdAt", new Date());
        n.setDataValue("TaskNotification", { task });
        io.to(task.solverId).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
          notification: n,
        });
      } else {
        const n = await createTaskNotification(
          task.id,
          `Úkol ${trimString(task.name, 100)} má být brzy dokončen`,
          // req.t("task.message.deadlineIn24Hours", {
          //   name: trimString(task.name, 100),
          // }),
          task.createdById,
          null
        );
        n.setDataValue("createdAt", new Date());
        n.setDataValue("TaskNotification", { task });
        io.to(task.createdById).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
          notification: n,
        });
        console.log("task.createdById", task.createdById);
      }
    }

    res.json({ success: true });
  } catch (error) {
    responseError(req, res, error);
  }
});

module.exports = router;
