const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Group = sequelize.define("Group", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [0, 100],
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  Group.associate = function (models) {
    Group.belongsToMany(models.User, {
      through: {
        model: models.UserGroup,
        unique: false,
        // scope: {
        //   taggable: "groupUser",
        // },
      },
      foreignKey: "groupId",
      constraints: false,
      as: "groupUsers",
    });
    Group.belongsToMany(models.Project, {
      through: models.ProjectGroup,
      foreignKey: "groupId",
    });
  };

  return Group;
};
