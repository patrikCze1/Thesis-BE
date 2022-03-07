const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TaskAttachment = sequelize.define(
    "TaskAttachment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [0, 255],
        },
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [0, 255],
        },
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [0, 255],
        },
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
        },
      },
      type: {
        type: DataTypes.STRING,
        validate: {
          len: [0, 255],
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      timestamps: false,
    }
  );

  TaskAttachment.associate = function (models) {
    TaskAttachment.belongsTo(models.Task, {
      foreignKey: "taskId",
      onDelete: "CASCADE",
    });
  };

  return TaskAttachment;
};
