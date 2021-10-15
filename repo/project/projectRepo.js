const { Project, User, Group, Client } = require("../../models/modelHelper");
const { Op } = require("sequelize");

/**
 *
 * @param {Object} user
 * @param {Object} filter
 * @returns
 */
exports.findByUser = async (user, filter) => {
  return await Project.findAll({
    // attributes: { exclude: ['user'] },
    where: {
      [Op.or]: [{ "$User.id$": user.id }, { "$group->groupUser.id$": user.id }],
    },
    include: [
      {
        model: Group,
        as: "group",
        attributes: [],
        include: {
          model: User,
          as: "groupUser",
          attributes: [],
        },
      },
      {
        model: User,
        as: "user",
        attributes: [], // dont select users fields
      },
      {
        model: Client,
      },
    ],
    limit: filter.limit ? parseInt(filter.limit) : null,
    offset: filter.page ? parseInt(filter.page) : 0,
    order: [
      [
        filter.orderBy ? filter.orderBy : "name",
        filter.sort ? filter.sort : "ASC",
      ],
    ],
  });
};

exports.findBySearch = async (user, query) => {
  return await Project.findAll({
    where: {
      [Op.or]: [
        { "$users->ProjectUser.userId$": user.id },
        { "$groups->groupUsers->UserGroup.userId$": user.id },
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
  });
};
