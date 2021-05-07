const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Group", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  });
};
