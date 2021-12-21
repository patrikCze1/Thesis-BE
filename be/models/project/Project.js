const { DataTypes } = require("sequelize");
const { PROJECT_STATE } = require("../../enum/enum");

module.exports = (sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: PROJECT_STATE.STATUS_ACTIVE,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      clientId: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      timeBudget: {
        type: DataTypes.FLOAT,
      },
      priceBudget: {
        type: DataTypes.FLOAT,
      },
      deadline: {
        type: DataTypes.DATE,
      },
    },
    {
      paranoid: true,
    }
  );

  Project.associate = function (models) {
    Project.belongsTo(models.Client, {
      foreignKey: { name: "clientId", allowNull: true, as: "client" },
    });
    Project.hasMany(models.Task, { onDelete: "CASCADE", foreignKey: "taskId" });
    Project.hasMany(models.ProjectStage, {
      onDelete: "CASCADE",
      foreignKey: "projectId",
      as: "projectStages",
    });
    Project.belongsTo(models.User, {
      foreignKey: "createdById",
      as: "creator",
    });
    Project.belongsToMany(models.User, {
      through: models.ProjectUser,
      foreignKey: "projectId",
      as: "users",
    });
    Project.belongsToMany(models.Group, {
      through: models.ProjectGroup,
      foreignKey: "projectId",
      as: "groups",
    });
  };

  return Project;
};