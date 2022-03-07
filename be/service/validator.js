const { projectRepo } = require("../repo");

/**
 * Check if object has all fields given in array
 * @param {array} fieldsArray
 * @param {Object} object
 * @returns
 */
const validateRequiredFields = (fieldsArray, object) => {
  const notValidFields = fieldsArray.filter(
    (field) => !object.hasOwnProperty(field) || object[field] == null
  );

  return {
    valid: !notValidFields.length > 0,
    requiredFields: notValidFields,
  };
};

/**
 * @param {User} user
 * @returns {boolean}
 */
const isUserInProject = async (user) => {
  const userProjects = await projectRepo.findByUser(user, {});
  return userProjects.rows.find((project) => project.id == req.params.id);
};

module.exports = {
  validateRequiredFields,
  isUserInProject,
};
