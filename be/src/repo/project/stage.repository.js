/**
 *
 * @param {number} boardId
 * @returns {Promise} Stage
 */
exports.findFirstByBoard = (models, boardId) => {
  console.log("findFirstByProject", boardId);
  return models.Stage.findOne({
    where: {
      boardId,
    },
    order: [["order", "ASC"]],
  });
};
