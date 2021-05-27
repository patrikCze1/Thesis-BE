const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define("Project", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdById: {
      type: DataTypes.INTEGER,
      references: {
        model: sequelize.models.User,
      }
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: sequelize.models.Client,
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
    //budget - time,price
  });

  Project.associate = function(models) {
    Project.belongsTo(models.Client, {foreignKey: 'clientId'});
    Project.hasMany(models.Task, { onDelete: 'CASCADE', foreignKey: { allowNull: false } });
    Project.belongsTo(models.User, {foreignKey: 'createdById'});
  };

  return Project;
};
