const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TaskChangeLog = sequelize.define("TaskChangeLog", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [0, 255],
          msg: "error.validation.stringTooLong",
        },
      },
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: sequelize.models.Task,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: sequelize.models.User,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  TaskChangeLog.associate = function (models) {
    TaskChangeLog.belongsTo(models.Task, {
      onDelete: "CASCADE",
      foreignKey: "taskId",
    });
    TaskChangeLog.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return TaskChangeLog;
};
