const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TimeTrack = sequelize.define("TimeTrack", {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      name: {
        type: DataTypes.STRING(50),
      },
      beginAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endAt: {
        type: DataTypes.DATE,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.User,
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      associate: function (models) {
        TimeTrack.belongsTo(models.User, {as: 'user'});
        TimeTrack.belongsTo(models.Task, {as: 'task'});
      }
    }
  );

  return TimeTrack;
};
