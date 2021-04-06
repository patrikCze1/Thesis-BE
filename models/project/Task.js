const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.STRING//?model?
    },
    priority: {
      type: DataTypes.INTEGER
    },
    deadline: {
      type: DataTypes.DATE
    },
    solver_id: {
      type: DataTypes.INTEGER
    }
    //begin / hours
    //subTask
  });
};