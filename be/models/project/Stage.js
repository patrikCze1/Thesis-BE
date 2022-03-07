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
        validate: {
          len: [0, 100],
        },
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 0,
        },
      },
      boardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.TINYINT,
        alidate: {
          isInt: true,
        },
      },
      limit: {
        type: DataTypes.INTEGER,
        alidate: {
          isInt: true,
        },
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
      as: "tasks",
      foreignKey: "stageId",
      onDelete: "set null",
    });
  };
  return Stage;
};
