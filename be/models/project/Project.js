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
        validate: {
          len: {
            args: [0, 255],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      key: {
        type: DataTypes.STRING(10),
        validate: {
          len: {
            args: [0, 10],
            msg: "error.validation.stringTooLong",
          },
        },
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
        // hours
        type: DataTypes.FLOAT,

        validate: {
          isFloat: true,
        },
      },
      priceBudget: {
        type: DataTypes.FLOAT,

        validate: {
          isFloat: true,
        },
      },
      deadline: {
        type: DataTypes.DATE,

        validate: {
          isDate: true,
        },
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
    Project.belongsTo(models.User, {
      foreignKey: "createdById",
      as: "creator",
    });
    Project.hasMany(models.Task, {
      onDelete: "CASCADE",
      as: "tasks",
      foreignKey: "projectId",
    });
    Project.hasMany(models.Board, {
      onDelete: "CASCADE",
      as: "boards",
      foreignKey: "projectId",
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
