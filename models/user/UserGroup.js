module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "UserGroup",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      group_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      // Other model options go here
    }
  );
};
