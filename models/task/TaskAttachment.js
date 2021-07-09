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
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      size: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      timestamps: false,
    }
  );

  TaskAttachment.associate = function(models) {
    TaskAttachment.belongsTo(models.Task, {foreignKey: 'taskId',  onDelete: 'CASCADE' });
  }
  
  return TaskAttachment;
};
