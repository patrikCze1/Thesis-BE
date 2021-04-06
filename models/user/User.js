const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('User', {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      username: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      surname: {
        type: DataTypes.STRING,
      },
      position: {
        type: DataTypes.STRING,
      }
    }
  );
};
