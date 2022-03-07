const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TimeTrack = sequelize.define("TimeTrack", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      validate: {
        len: [0, 255],
      },
    },
    beginAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    endAt: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        isGreaterThanStart(value) {
          if (new Date(value) < new Date(this.beginAt)) {
            throw new Error("Začátek musí být menší než konec");
          }
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: sequelize.models.User,
      },
    },
    taskId: {
      type: DataTypes.INTEGER,
    },
    // billable: {
    //   type:DataTypes.BOOLEAN,
    //   allowNull:false,
    //   defaultValue:true
    // },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  TimeTrack.associate = (models) => {
    TimeTrack.belongsTo(models.User, { as: "user", foreignKey: "userId" });
    TimeTrack.belongsTo(models.Task, { as: "task", foreignKey: "taskId" });
    TimeTrack.belongsTo(models.Project, {
      as: "project",
      foreignKey: "projectId",
    });
  };

  return TimeTrack;
};
