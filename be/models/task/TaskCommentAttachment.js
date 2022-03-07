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
        validate: {
          len: {
            args: [0, 255],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [0, 255],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [0, 255],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      commentId: {
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
          len: {
            args: [0, 255],
            msg: "error.validation.stringTooLong",
          },
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

  TaskCommentAttachment.associate = function (models) {
    TaskCommentAttachment.belongsTo(models.TaskComment, {
      onDelete: "CASCADE",
      foreignKey: "commentId",
      as: "comment",
    });
  };

  return TaskCommentAttachment;
};
