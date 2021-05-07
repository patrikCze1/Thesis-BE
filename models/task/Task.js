const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Task', {
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
    //begin / hours
    //budget - time,price
    //muted, favourites...
  });
};