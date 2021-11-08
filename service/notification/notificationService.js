const { notificationType } = require("./../../models/constantHelper");
const {
  Notification,
  TaskNotification,
} = require("./../../models/modelHelper");

/**
 *
 * @param {number} taskId
 * @param {string} message
 * @param {number} receiverId
 * @param {number} createdById
 */
const createTaskNotification = async (
  taskId,
  message,
  receiverId,
  createdById
) => {
  const newNotif = await Notification.create({
    message,
    userId: receiverId,
    type: notificationType.TYPE_TASK,
    createdById,
  });
  await TaskNotification.create({
    taskId,
    notificationId: newNotif.id,
  });

  return newNotif;
};

module.exports = {
  createTaskNotification,
};
