const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskNotification = sequelize.define("TaskNotification", {
    },
    { timestamps: false }
  );

  return TaskNotification;
};
