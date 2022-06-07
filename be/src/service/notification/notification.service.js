const { NOTIFICATION_TYPE } = require("../../../enum/enum");
const { Notification, TaskNotification } = require("../../models/modelHelper");
const { sendMail } = require("../../email/config");

/**
 *
 * @param {number} taskId
 * @param {string} message
 * @param {number} receiverId
 * @param {number} createdById
 * @returns {TaskNotification}
 * @throws {error}
 */
const createTaskNotification = async (
  taskId,
  message,
  receiverId,
  createdById
) => {
  try {
    const newNotif = await Notification.create({
      message,
      userId: receiverId,
      type: NOTIFICATION_TYPE.TYPE_TASK,
      createdById,
    });
    await TaskNotification.create({
      taskId,
      notificationId: newNotif.id,
    });

    return newNotif;
  } catch (error) {
    console.error("createTaskNotification", error);
    throw error;
  }
};

/**
 *
 * @param {string} to
 * @param {string} subject
 * @param {string} templatePath
 * @param {string} template
 * @param {Object} emailData
 */
const sendEmailNotification = (
  to,
  subject,
  templatePath,
  template,
  emailData = {}
) => {
  try {
    sendMail(to, subject, templatePath, template, emailData);
  } catch (error) {
    console.error("sendEmailNotification", error);
  }
};

module.exports = {
  createTaskNotification,
  sendEmailNotification,
};
