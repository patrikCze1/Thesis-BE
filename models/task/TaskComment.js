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
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      associate: function(models) {
        TaskComment.belongsTo(models.User, {foreignKey: 'userId', as: 'user'});
        TaskComment.belongsTo(models.Task, {foreignKey: 'taskId', onDelete: 'CASCADE'});
        TaskComment.hasMany(models.TaskCommentAttachment, {foreignKey: 'commentId'});
      }
    }
  );

  return TaskComment;
};
