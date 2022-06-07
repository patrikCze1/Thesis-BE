const { Stage } = require("../../models/modelHelper");

/**
 *
 * @param {number} boardId
 * @returns {Promise} Stage
 */
exports.findFirstByBoard = (boardId) => {
  console.log("findFirstByProject", boardId);
  return Stage.findOne({
    where: {
      boardId,
    },
    order: [["order", "ASC"]],
  });
};
