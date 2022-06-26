/**
 *
 * @param {number} boardId
 * @returns {Promise} Stage
 */
exports.findFirstByBoard = (db, boardId) => {
  console.log("findFirstByProject", boardId);
  return db.Stage.findOne({
    where: {
      boardId,
    },
    order: [["order", "ASC"]],
  });
};
