const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("Project", {
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
    },
    //budget - time,price
  });
};
