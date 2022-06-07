const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectGroup = sequelize.define("ProjectGroup", {
      groupId: {
        type: DataTypes.INTEGER,
      },
      projectId: {
        type: DataTypes.INTEGER,
      },
    },
    { timestamps: false }
  );

  return ProjectGroup;
};
