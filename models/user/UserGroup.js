const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("UserGroup", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      GroupId: {
        type: DataTypes.INTEGER,
      },
      UserId: {
        type: DataTypes.INTEGER,
      },
    },
    { timestamps: false }
  );
};
