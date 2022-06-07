const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TaskNotification = sequelize.define(
    "TaskNotification",
    {},
    { timestamps: false }
  );

  TaskNotification.associate = function (models) {
    TaskNotification.belongsTo(models.Notification, {
      as: "notification",
      foreignKey: "notificationId",
    });
    TaskNotification.belongsTo(models.Task, {
      as: "task",
      foreignKey: "taskId",
    });
  };

  TaskNotification.removeAttribute("id");

  return TaskNotification;
};
