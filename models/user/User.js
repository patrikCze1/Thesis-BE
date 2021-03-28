module.exports = (sequelize, DataTypes, Model) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
    },
    { 
      sequelize,
      modelName: "User",

      //   freezeTableName: true,
      // tableName: 'my_very_custom_table_name'
    }
  );

  return User;
};
