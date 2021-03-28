module.exports = (sequelize, DataTypes) => {

  const Project = sequelize.define('Project', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });

  return Project;
}