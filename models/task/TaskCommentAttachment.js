const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskCommentAttachment = sequelize.define("TaskCommentAttachment", {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
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
        TaskCommentAttachment.belongsTo(models.TaskComment);
      }
    }
  );
  
  return TaskCommentAttachment;
};
