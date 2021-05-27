const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskAttachment = sequelize.define("TaskAttachment", {
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
      taskId: {
        type: DataTypes.INTEGER,
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
        TaskAttachment.belongsTo(models.Task, { onDelete: 'CASCADE', foreignKey: { allowNull: false } });
      }
    }
  );
  
  return TaskAttachment;
};
