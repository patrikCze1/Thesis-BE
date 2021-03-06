const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TaskCheck = sequelize.define("TaskCheck", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [0, 255],
          msg: "error.validation.stringTooLong",
        },
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    solverId: {
      type: DataTypes.INTEGER,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

  TaskCheck.associate = function (models) {
    TaskCheck.belongsTo(models.Task, { foreignKey: "taskId", as: "task" });
    TaskCheck.belongsTo(models.User, { foreignKey: "solverId", as: "solver" });
  };

  return TaskCheck;
};
