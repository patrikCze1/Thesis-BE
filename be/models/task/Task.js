const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      priority: {
        type: DataTypes.INTEGER, //?model?
        allowNull: false,
        defaultValue: 1,
      },
      deadline: {
        type: DataTypes.DATE,
      },
      colorCode: {
        type: DataTypes.STRING(7),
        defaultValue: "#ffffff",
      },
      solverId: {
        type: DataTypes.INTEGER,
      },
      createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.INTEGER,
      },
      projectStageId: {
        type: DataTypes.INTEGER,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      // completedAt: {
      //   type: DataTypes.DATE,
      // },
      //begin / hours
      //budget - time,price
      //muted, favourites...
      // todo proverit taskId
    },
    {
      paranoid: true,
    }
  );

  Task.associate = function (models) {
    Task.belongsTo(models.User, { foreignKey: "createdById", as: "creator" });
    Task.belongsTo(models.User, { foreignKey: "solverId", as: "solver" });
    Task.belongsTo(models.Project, { foreignKey: "projectId", as: "project" });
    Task.belongsTo(models.Task, {
      foreignKey: "parentId",
      as: "parentTask",
      onDelete: "SET NULL",
    });
    Task.belongsTo(models.ProjectStage, {
      foreignKey: "projectStageId",
      as: "projectStage",
      onDelete: "SET NULL",
    });
    Task.hasMany(models.TaskAttachment, {
      foreignKey: "taskId",
      as: "attachments",
    });
    Task.hasMany(models.TaskComment, {
      foreignKey: "taskId",
      as: "taskComments",
    });
    Task.hasMany(models.TaskChangeLog, { foreignKey: "taskId" });
    Task.hasMany(models.TaskCheck, { foreignKey: "taskId", as: "checks" });
    Task.hasMany(models.TimeTrack, { foreignKey: "taskId" });
    Task.hasMany(models.TaskNotification, { foreignKey: "taskId" });
  };

  return Task;
};
