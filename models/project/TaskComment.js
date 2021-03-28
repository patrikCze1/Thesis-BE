module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "TaskComment",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }
  );
};
