const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define("TaskNotification", {
    },
    { timestamps: false }
  );
};
