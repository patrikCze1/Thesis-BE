const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('SubTask', {
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
      defaultValue: false,
      allowNull: false,
    },
    solvedById: {
      type: DataTypes.INTEGER
    }
  });
};