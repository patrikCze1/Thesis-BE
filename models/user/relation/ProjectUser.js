const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectUser = sequelize.define("ProjectUser", {
      userId: {
        type: DataTypes.INTEGER,
      },
      projectId: {
        type: DataTypes.INTEGER,
      },
    },
    { timestamps: false }
  );

  return ProjectUser;
};