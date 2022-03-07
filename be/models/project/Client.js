const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Client = sequelize.define("Client", {
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
    emails: {
      type: DataTypes.JSON,
    },
    phones: {
      type: DataTypes.JSON,
    },
    webpage: {
      type: DataTypes.STRING(100),
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

  Client.associate = function (models) {
    Client.hasMany(models.Project, {
      onDelete: "SET NULL",
      foreignKey: "clientId",
      as: "projects",
    });
  };

  return Client;
};
