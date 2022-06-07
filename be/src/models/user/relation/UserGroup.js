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

  // UserGroup.associate = function (models) {
  //   UserGroup.belongsTo(models.User);
  //   UserGroup.belongsTo(models.Group);
  // }

  return UserGroup;
};
