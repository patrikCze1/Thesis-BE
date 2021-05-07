const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('User', {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      username: {
        type: DataTypes.STRING(20),
      },
      password: {
        type: DataTypes.STRING(100),
      },
      email: {
        type: DataTypes.STRING(50),
      },
      firstName: {
        type: DataTypes.STRING(20),
      },
      lastName: {
        type: DataTypes.STRING(20),
      },
      position: {
        type: DataTypes.STRING(50),
      },
      sex: {
        type: DataTypes.STRING(1),
      },
      //role
    }
  );
};
