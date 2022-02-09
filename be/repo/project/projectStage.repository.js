const { ProjectStage } = require("../../models/modelHelper");

/**
 *
 * @param {number} projectId
 * @returns {Promise} ProjectStage
 */
exports.findFirstByProject = (projectId) => {
  console.log("findFirstByProject", projectId);
  return ProjectStage.findOne({
    where: {
      projectId: projectId,
    },
    order: [["order", "ASC"]],
  });
};
