const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskCheck = sequelize.define('TaskCheck', {
    id: {
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    solverId: {
      type: DataTypes.INTEGER,
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
  });

  TaskCheck.associate = function(models) {
    TaskCheck.belongsTo(sequelize.models.Task, {foreignKey: 'taskId', as: 'task'});
    TaskCheck.belongsTo(sequelize.models.User, {foreignKey: 'solverId', as: 'solver'});
  }
  
  return TaskCheck;
};