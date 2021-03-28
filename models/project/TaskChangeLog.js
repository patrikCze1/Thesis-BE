module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "TaskChangeLog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      // Other model options go here
    }
  );
};
