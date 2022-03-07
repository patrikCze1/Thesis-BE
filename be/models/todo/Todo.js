const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Todo = sequelize.define("Todo", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [0, 255],
          msg: "error.validation.stringTooLong",
        },
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: sequelize.models.User,
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

  Todo.associate = (models) => {
    Todo.belongsTo(models.User, { as: "user", foreignKey: "userId" });
  };

  return Todo;
};
