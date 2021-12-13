const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProjectStage = sequelize.define(
    "ProjectStage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  ProjectStage.associate = function (models) {
    ProjectStage.belongsTo(models.Project, {
      as: "project",
      foreignKey: "projectId",
    });
    ProjectStage.hasMany(models.Task, {
      foreignKey: "projectStageId",
      onDelete: "set null",
    });
  };
  return ProjectStage;
};
