const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TaskCommentAttachment = sequelize.define(
    "TaskCommentAttachment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      commentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING,
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

  TaskCommentAttachment.associate = function (models) {
    TaskCommentAttachment.belongsTo(models.TaskComment, {
      onDelete: "CASCADE",
      foreignKey: "commentId",
      as: "attachmetns",
    });
  };

  return TaskCommentAttachment;
};
