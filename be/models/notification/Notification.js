const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define("Notification", {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      message: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      //url?
    }
  );

  Notification.associate = function (models) {
    Notification.belongsTo(models.User, {as: 'user', foreignKey: 'userId'});
    Notification.belongsTo(models.User, {as: 'creator', foreignKey: 'createdById'});
    Notification.hasOne(models.TaskNotification, {foreignKey: 'notificationId'});
  }
  return Notification;
};