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

/**
 *
 * @param {string} string
 * @param {number} length
 * @returns {string}
 */
const trimString = (string, length) => {
  return string.length > length ? string.substring(0, length) + "..." : string;
};

module.exports = {
  getFeUrl,
  getFeTaskUrl,
  trimString,
};
