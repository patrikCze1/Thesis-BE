const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("TaskChangeLog", {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }
  );
};
