const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define("Task", {
    id: {
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,//?model?
      allowNull: false,
      defaultValue: 1,
    },
    priority: {
      type: DataTypes.INTEGER,//?model?
      allowNull: false,
      defaultValue: 1,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
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
    parentId: { // parent task
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
    //begin / hours
    //budget - time,price
    //muted, favourites...
    // todo proverit taskId
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User, {foreignKey: 'createdById', as: 'creator'});
    Task.belongsTo(models.User, {foreignKey: 'solverId', as: 'solver'});
    Task.belongsTo(models.Project, {foreignKey: 'projectId', as: 'project'});
    Task.hasMany(models.Task, {foreignKey: 'parentId',  as: 'subTask', onDelete: 'SET NULL' });
    Task.hasMany(models.TaskAttachment, {foreignKey: 'taskId'});
    Task.hasMany(models.TaskComment, {foreignKey: 'taskId', as: 'taskComments'});
    Task.hasMany(models.TaskChangeLog, {foreignKey: 'taskId'});
    Task.hasMany(models.TaskCheck, {foreignKey: 'taskId'});
    Task.hasMany(models.TimeTrack, {foreignKey: 'taskId'});
    Task.hasMany(models.TaskNotification, {foreignKey: 'taskId'});
  }

  return Task;
};