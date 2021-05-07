const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("TaskCommentAttachment", {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }
  );
};
