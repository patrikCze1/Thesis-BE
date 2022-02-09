/**
 *
 * @param {Date} date
 * @param {number} seconds
 * @returns {Date}
 */
module.exports.addTimeToDate = (date, seconds) => {
  if (!(date instanceof Date)) date = new Date(date);
  return new Date(date.getTime() + seconds * 1000);
};
