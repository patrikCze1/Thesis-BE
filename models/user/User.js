const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      username: {
        type: DataTypes.STRING(20),
      },
      password: {
        type: DataTypes.STRING(100),
      },
      email: {
        type: DataTypes.STRING(50),
      },
      phone: {
        type: DataTypes.STRING(16),
      },
      firstName: {
        type: DataTypes.STRING(20),
      },
      lastName: {
        type: DataTypes.STRING(20),
      },
      position: {
        type: DataTypes.STRING(50),
      },
      sex: {
        type: DataTypes.STRING(1),
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      //role
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Task, { foreignKey: 'createdById', as: 'user', });
    User.hasMany(models.Project, {foreignKey: 'createdById'});
    User.hasMany(models.Task, {foreignKey: 'solverId'});
    User.hasMany(models.TaskCheck, {foreignKey: 'solverId'});
    User.hasMany(models.TaskComment, {foreignKey: 'userId'});
    User.hasMany(models.TaskChangeLog, {foreignKey: 'userId'});
    User.hasMany(models.TimeTrack, {foreignKey: 'userId'});
    User.hasMany(models.Todo, {foreignKey: 'userId'});
  }

  return User;
};
