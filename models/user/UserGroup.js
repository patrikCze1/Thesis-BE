const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserGroup = sequelize.define("UserGroup", {
      groupId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
    },
    { timestamps: false }
  );

  return UserGroup;
};
