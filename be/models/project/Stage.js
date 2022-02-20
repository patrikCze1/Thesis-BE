const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Stage = sequelize.define(
    "Stage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      boardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.TINYINT,
      },
      limit: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  );

  Stage.associate = function (models) {
    Stage.belongsTo(models.Board, {
      as: "board",
      foreignKey: "boardId",
    });
    Stage.hasMany(models.Task, {
      foreignKey: "stageId",
      onDelete: "set null",
    });
  };
  return Stage;
};
