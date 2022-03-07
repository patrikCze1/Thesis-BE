const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Board = sequelize.define("Board", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [0, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    createdById: {
      type: DataTypes.INTEGER,
    },
    projectId: {
      type: DataTypes.INTEGER,
    },
    beginAt: {
      type: DataTypes.DATEONLY,
    },
    endAt: {
      type: DataTypes.DATEONLY,
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

  Board.associate = function (models) {
    Board.belongsTo(models.Project, {
      foreignKey: { name: "projectId", as: "project" },
    });
    Board.hasMany(models.Task, { onDelete: "CASCADE", foreignKey: "boardId" });
    Board.hasMany(models.Stage, {
      onDelete: "CASCADE",
      as: "stages",
      foreignKey: "boardId",
    });
    Board.belongsTo(models.User, {
      foreignKey: "createdById",
      as: "creator",
    });
  };

  return Board;
};
