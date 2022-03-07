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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [0, 255],
        },
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 0,
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: true,
          min: 0,
        },
      },
      deadline: {
        type: DataTypes.DATE,

        validate: {
          isDate: true,
        },
      },
      colorCode: {
        type: DataTypes.STRING(7),
        defaultValue: "#ffffff",
        validate: {
          len: [0, 7],
        },
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
        references: {
          model: "Tasks",
          key: "id",
        },
      },
      stageId: {
        type: DataTypes.INTEGER,
      },
      boardId: {
        type: DataTypes.INTEGER,
      },
      estimation: {
        type: DataTypes.FLOAT,
        validate: {
          isFloat: true,
        },
      },
      archived: {
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
      completedAt: {
        type: DataTypes.DATE,
      },
      //begin
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
    Task.belongsTo(models.Board, {
      foreignKey: "boardId",
      as: "board",
      onDelete: "SET NULL",
    });
    Task.belongsTo(Task, {
      foreignKey: "parentId",
      as: "parent",
      onDelete: "SET NULL",
    });
    Task.belongsTo(models.Stage, {
      foreignKey: "stageId",
      as: "stage",
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
    Task.hasMany(models.TaskChangeLog, {
      foreignKey: "taskId",
      as: "changeLogs",
    });
    Task.hasMany(models.TaskCheck, { foreignKey: "taskId", as: "checks" });
    Task.hasMany(models.TimeTrack, { foreignKey: "taskId", as: "timeTracks" });
    Task.hasMany(models.TaskNotification, {
      foreignKey: "taskId",
      as: "notifications",
    });
    // Task.hasMany(Task, {
    //   foreignKey: "parentId",
    //   as: "subTasks",
    // });
  };

  return Task;
};
