const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("Todo", {
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
    },
  });
};
