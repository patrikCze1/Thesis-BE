const { Op } = require("sequelize");
const { addTimeToDate } = require("../../service/date");

exports.findTasksWithDeadlineIn24h = async (db) => {
  return await db.Task.findAll({
    subQuery: false,
    where: {
      completedAt: { [Op.is]: null },
      deadline: {
        [Op.gt]: new Date(),
        [Op.lt]: addTimeToDate(new Date(), 60 * 60 * 24),
        [Op.ne]: null,
      },
    },
  });
};
