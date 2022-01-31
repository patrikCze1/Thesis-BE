const { User } = require("../../models/modelHelper");
// const { Op } = require("sequelize");

/**
 *
 * @param {string} user
 * @returns {User|null}
 */
exports.findOneByEmail = async (email) => {
  try {
    return await User.findOne({ where: { email } });
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 *
 * @param {number} id
 * @returns {User|null}
 */
exports.findOneById = async (id) => {
  try {
    return await User.findByPk(id);
  } catch (error) {
    console.error(error);
    return null;
  }
};
