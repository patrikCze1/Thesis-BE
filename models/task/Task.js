const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  // class Task extends Model {}
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
    parentId: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    }
    //begin / hours
    //budget - time,price
    //muted, favourites...
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User, {foreignKey: 'createdById', as: 'user'});
    Task.belongsTo(models.User, {foreignKey: 'solverId', as: 'solver'});
    Task.belongsTo(models.Project, {foreignKey: 'projectId', as: 'project'});
    Task.hasMany(Task, {foreignKey: 'parentId',  as: 'subTask', onDelete: 'CASCADE' });
    Task.hasMany(models.TaskAttachment, {foreignKey: 'taskId'});
    Task.hasMany(models.TaskComment, {foreignKey: 'taskId'});
    Task.hasMany(models.TaskChangeLog, {foreignKey: 'taskId'});
    Task.hasMany(models.TaskCheck, {foreignKey: 'taskId'});
    Task.hasMany(models.TimeTrack, {foreignKey: 'taskId'});
  }

  return Task;
};