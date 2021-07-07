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
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(16),
      },
      firstName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      position: {
        type: DataTypes.STRING(50),
      },
      sex: {
        type: DataTypes.STRING(1),
      },
      shortName: {
        type: DataTypes.STRING(3),
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      //role, image???
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Task, { foreignKey: 'createdById', as: 'creator', });
    User.hasMany(models.Project, {foreignKey: 'createdById'});
    User.hasMany(models.Task, {foreignKey: 'solverId'});
    User.hasMany(models.TaskCheck, {foreignKey: 'solverId'});
    User.hasMany(models.TaskComment, {foreignKey: 'userId', as: 'taskCommentUser'});
    User.hasMany(models.TaskChangeLog, {foreignKey: 'userId'});
    User.hasMany(models.TimeTrack, {foreignKey: 'userId'});
    User.hasMany(models.Todo, {foreignKey: 'userId'});
    User.hasMany(models.Notification, {foreignKey: 'userId'});
    User.hasMany(models.Notification, {foreignKey: 'createdById'});
    User.belongsToMany(models.Group, {
      through: {
        model: models.UserGroup,
        unique: false,
        // scope: {
        //   taggable: "groupUser",
        // },
      },
      foreignKey: "userId",
      as: 'groupUser',
    });
    User.hasMany(models.UserGroup, {foreignKey: 'userId'});
    User.belongsToMany(models.Project, { 
      through: {
        model: models.ProjectUser,
        unique: false,
        // scope: {
        //   taggable: "projectUser",
        // },
      },
      foreignKey: "userId",
      as: 'projectUser',
    });
    User.hasMany(models.ProjectUser, {foreignKey: 'userId'});
  }

  return User;
};
