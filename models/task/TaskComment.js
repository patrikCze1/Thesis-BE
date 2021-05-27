const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskComment = sequelize.define("TaskComment", {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.User,
        }
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Task,
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      associate: function(models) {
        TaskComment.belongsTo(models.Task, { onDelete: 'CASCADE', foreignKey: 'taskId', });
        TaskComment.hasMany(models.TaskCommentAttachment);
        TaskComment.belongsTo(models.User, {foreignKey: 'userId', as: 'user'});
      }
    }
  );

  return TaskComment;
};
