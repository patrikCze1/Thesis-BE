/**
 *
 * @param {object} user
 * @returns
 */
module.exports.getFullName = (user) => {
  if (!user) return "";
  return `${user.lastName} ${user.firstName}`;
};
