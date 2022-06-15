const bcrypt = require("bcrypt");

/**
 *
 * @param {object} user
 * @returns
 */
const getFullName = (user) => {
  if (!user) return "";
  return `${user.lastName} ${user.firstName}`;
};

const createHashedPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports = {
  getFullName,
  createHashedPassword,
};
