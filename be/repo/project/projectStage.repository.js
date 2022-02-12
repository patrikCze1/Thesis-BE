const { Stage } = require("../../models/modelHelper");

/**
 *
 * @param {number} projectId
 * @returns {Promise} Stage
 */
exports.findFirstByProject = (projectId) => {
  console.log("findFirstByProject", projectId);
  return Stage.findOne({
    where: {
      projectId: projectId,
    },
    order: [["order", "ASC"]],
  });
};
