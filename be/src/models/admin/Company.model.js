const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Company = sequelize.define(
    "Company",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      connectionString: {
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
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: {
            args: [0, 50],
            msg: "error.validation.stringTooLong",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
      },
      companyId: {
        type: DataTypes.STRING,
      },
      street: {
        type: DataTypes.STRING,
      },
      streetNo: {
        type: DataTypes.STRING(10),
      },
      zip: {
        type: DataTypes.STRING(7),
      },
      city: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING(100),
        validate: {
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
      emailVerifiedAt: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      paranoid: true,
    }
  );

  return Company;
};
