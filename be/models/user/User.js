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
          msg: "This username is already taken.",
        },
        allowNull: false,

        validate: {
          len: [0, 50],
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [0, 100],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        unique: {
          args: true,
          msg: "This email is already taken.",
        },
        allowNull: false,
        validate: {
          isEmail: {
            msg: "Email is not valid",
          },
          len: [0, 100],
        },
      },
      phone: {
        type: DataTypes.STRING(16),
        validate: {
          len: [0, 16],
        },
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [0, 50],
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [0, 50],
        },
      },
      position: {
        type: DataTypes.STRING(50),
        validate: {
          len: [0, 50],
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
          len: [0, 255],
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
    User.hasMany(models.Task, { foreignKey: "createdById", as: "creator" });
    User.hasMany(models.Project, { foreignKey: "createdById" });
    User.hasMany(models.Task, { foreignKey: "solverId" });
    User.hasMany(models.TaskCheck, { foreignKey: "solverId" });
    User.hasMany(models.TaskComment, {
      foreignKey: "userId",
      as: "taskCommentUser",
    });
    User.hasMany(models.TaskChangeLog, { foreignKey: "userId" });
    User.hasMany(models.TimeTrack, { foreignKey: "userId" });
    User.hasMany(models.Todo, { foreignKey: "userId" });
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
