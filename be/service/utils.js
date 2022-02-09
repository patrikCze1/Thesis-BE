/**
 *
 * @returns {string}
 */
const getFeUrl = () => {
  return process.env.FE_URI;
};

/**
 *
 * @param {number} projectId
 * @param {number} taskId
 * @returns {string} url
 */
const getFeTaskUrl = (projectId, taskId) => {
  return `${getFeUrl()}/projekty/${projectId}?ukol=${taskId}`;
};

module.exports = {
  getFeUrl,
  getFeTaskUrl,
};
