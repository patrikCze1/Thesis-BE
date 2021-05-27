const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Task extends Model {}
  Task.init({
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
      // references: {
      //   model: sequelize.models.User,
      // }
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: {
      //   model: sequelize.models.User,
      // }
    },
    // projectId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   // references: {
    //   //   model: sequelize.models.Project,
    //   // }
    // },
    parentId: {
      type: DataTypes.INTEGER,
      // references: {
      //   model: sequelize.models.Task,
      // }
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
  }, {
    sequelize,
  });

  Task.associate = function(models) {
    Task.belongsTo(models.User, {foreignKey: 'createdById', as: 'user'});
    Task.belongsTo(models.User, {foreignKey: 'solverId', as: 'solver'});
    Task.belongsTo(models.Project, {foreignKey: 'projectId', as: 'project'});
    Task.hasMany(Task, { onDelete: 'CASCADE',  foreignKey: 'parentId',  as: 'subTask' });
    Task.hasMany(models.TaskAttachment);
    Task.hasMany(models.TaskComment);
    Task.hasMany(models.TaskChangeLog);
    Task.hasMany(models.TaskCheck);
    Task.hasMany(models.TimeTrack);
    console.log(models);
  }

  return Task;
};