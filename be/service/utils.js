/**
 *
 * @returns {string}
 */
const getFeUrl = () => {
  return process.env.FE_URI;
};

module.exports = {
  getFeUrl,
};
