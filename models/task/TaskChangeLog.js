const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskChangeLog = sequelize.define("TaskChangeLog", {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.Task,
        }
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
      associate: function(models) {
        TaskChangeLog.belongsTo(models.Task, { onDelete: 'CASCADE', foreignKey: 'taskId', });
        TaskChangeLog.belongsTo(models.User, {foreignKey: 'userId', as: 'user'});
      }
    }
  );

  return TaskChangeLog;
};
