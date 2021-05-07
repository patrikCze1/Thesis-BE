const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("UserGroup", {
      groupId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
    },
    { timestamps: false }
  );
};
