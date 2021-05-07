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
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,//?model?
    },
    priority: {
      type: DataTypes.INTEGER,//?model?
    },
    deadline: {
      type: DataTypes.DATE,
    },
    solverId: {
      type: DataTypes.INTEGER,
    },
    createdById: {
      type: DataTypes.INTEGER,
    },
    //begin / hours
  });
};