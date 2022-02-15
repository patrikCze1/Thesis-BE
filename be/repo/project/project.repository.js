const { Project, User, Group, Client } = require("../../models/modelHelper");
const { Op } = require("sequelize");

/**
 *
 * @param {Object} user
 * @param {Object} filter
 * @returns
 */
exports.findByUser = async (user, filter) => {
  return await Project.findAndCountAll({
    // attributes: { exclude: ['user'] },
    where: {
      [Op.or]: [
        { "$creator.id$": user.id },
        { "$groups.groupUsers.UserGroup.userId$": user.id },
        { "$users.ProjectUser.userId$": user.id },
      ],
    },
    include: [
      {
        model: Group,
        as: "groups",
        attributes: [],
        include: {
          model: User,
          as: "groupUsers",
          attributes: [],
        },
      },
      {
        model: User,
        as: "creator",
      },
      {
        model: User,
        as: "users",
        attributes: [],
      },
      {
        model: Client,
        // as: "client",
      },
    ],
    limit: filter.limit ? parseInt(filter.limit) : null,
    offset: filter.offset ? parseInt(filter.offset) : 0,
    order: [
      [
        filter.orderBy ? filter.orderBy : "name",
        filter.sort ? filter.sort : "ASC",
      ],
    ],
  });
};

/**
 *
 * @param {Object} user
 * @param {string} query
 * @param {Object} filter
 * @returns
 */
exports.findBySearch = async (user, query, filter) => {
  return await Project.findAll({
    subQuery: false,
    where: {
      [Op.or]: [
        { "$groups->groupUsers->UserGroup.userId$": user.id },
        { "$users.ProjectUser.userId$": user.id },
        { createdById: user.id },
      ],
      name: {
        [Op.like]: `%${query}%`,
      },
    },
    include: [
      {
        model: Group,
        as: "groups",
        attributes: [],
        include: {
          model: User,
          as: "groupUsers",
          attributes: [],
        },
      },
      {
        model: User,
        as: "users",
        attributes: [],
      },
    ],
    limit: filter.limit ? parseInt(filter.limit) : null,
    offset: filter.offset ? parseInt(filter.offset) : 0,
    order: [
      [
        filter.orderBy ? filter.orderBy : "name",
        filter.sort ? filter.sort : "ASC",
      ],
    ],
  });
};
