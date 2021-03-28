module.exports = (sequelize, DataTypes, Model) => {
  class Task extends Model {
    static associate(models) {
      // define association here
    }
  };
  Task.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING//?classa?
    },
  }, {
    sequelize,
    modelName: 'Task',
  });

  return Task;
};