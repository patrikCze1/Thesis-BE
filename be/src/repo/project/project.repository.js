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
    subQuery: false,
    where: {
      [Op.or]: [
        { createdById: user.id },
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

/**
 *
 * @param {number} projectId
 * @param {number} userId
 * @returns {boolean}
 */
exports.isUserInProject = async (projectId, userId) => {
  try {
    const project = await Project.findOne({
      subQuery: false,
      where: {
        [Op.or]: [
          { "$groups->groupUsers->UserGroup.userId$": userId },
          { "$users.ProjectUser.userId$": userId },
          { createdById: userId },
        ],
        id: projectId,
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

    if (project) return true;
    else return false;
  } catch (error) {
    console.error("isUserInProject error", error);
    return false;
  }
};
