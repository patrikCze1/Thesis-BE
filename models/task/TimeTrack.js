const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("TimeTrack", {
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
        allowNull: false,
      },
    }
  );
};
