const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        unique: {
          args: true,
          msg: "error.validation.usernameAlreadyExists",
        },
        allowNull: false,
        validate: {
          len: {
            args: [0, 50],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: {
            args: [0, 100],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          args: true,
          msg: "error.validation.emailAlreadyExists",
        },
        validate: {
          isEmail: {
            msg: "error.validation.emailNotValid",
          },
          len: {
            args: [0, 100],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      phone: {
        type: DataTypes.STRING(16),
        validate: {
          len: {
            args: [0, 16],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: {
            args: [0, 50],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: {
            args: [0, 50],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      position: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [0, 50],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      sex: {
        type: DataTypes.STRING(1),
        validate: {
          isIn: ["M", "F"],
        },
      },
      roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: '["user"]',
      },
      passwordResetHash: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [0, 255],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      allowEmailNotification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deactivated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
    }
  );

  User.associate = function (models) {
    User.hasMany(models.Task, { as: "creator", foreignKey: "creatorId" });
    User.hasMany(models.Task, { as: "tasks", foreignKey: "solverId" });
    User.hasMany(models.Project, { as: "projects", foreignKey: "userId" });
    User.hasMany(models.TaskCheck, { as: "taskChecks", foreignKey: "userId" });
    User.hasMany(models.TaskComment, {
      as: "taskCommentUser",
      foreignKey: "userId",
    });
    User.hasMany(models.TaskChangeLog, {
      as: "taskChangeLogs",
      foreignKey: "userId",
    });
    User.hasMany(models.TimeTrack, { as: "timeTracks", foreignKey: "userId" });
    User.hasMany(models.Todo, { as: "todos", foreignKey: "userId" });
    User.hasMany(models.Notification, { foreignKey: "userId" });
    User.hasMany(models.Notification, { foreignKey: "createdById" });
    User.belongsToMany(models.Group, {
      through: {
        model: models.UserGroup,
        unique: false,
        // scope: {
        //   taggable: "groupUser",
        // },
      },
      foreignKey: "userId",
      as: "groupUsers",
    });
    User.hasMany(models.UserGroup, { foreignKey: "userId" });
    User.belongsToMany(models.Project, {
      through: {
        model: models.ProjectUser,
        unique: false,
        // scope: {
        //   taggable: "projectUser",
        // },
      },
      foreignKey: "userId",
      as: "projectUser",
    });
    User.hasMany(models.ProjectUser, { foreignKey: "userId" });
  };

  return User;
};
