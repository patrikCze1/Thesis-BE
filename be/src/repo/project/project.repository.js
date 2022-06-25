const { Op } = require("sequelize");

/**
 *
 * @param {Object} user
 * @param {Object} filter
 * @returns
 */
exports.findByUser = async (models, user, filter) => {
  return await models.Project.findAndCountAll({
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
        model: models.Group,
        as: "groups",
        attributes: [],
        include: {
          model: models.User,
          as: "groupUsers",
          attributes: [],
        },
      },
      {
        model: models.User,
        as: "creator",
      },
      {
        model: models.User,
        as: "users",
        attributes: [],
      },
      {
        model: models.Client,
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
 * @param {DbModels} db
 * @param {Object} user
 * @param {string} query
 * @param {Object} filter
 * @returns
 */
exports.findBySearch = async (db, user, query, filter) => {
  return await db.Project.findAll({
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
        model: db.Group,
        as: "groups",
        attributes: [],
        include: {
          model: db.User,
          as: "groupUsers",
          attributes: [],
        },
      },
      {
        model: db.User,
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
exports.isUserInProject = async (db, projectId, userId) => {
  try {
    const project = await db.Project.findOne({
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
          model: db.Group,
          as: "groups",
          attributes: [],
          include: {
            model: db.User,
            as: "groupUsers",
            attributes: [],
          },
        },
        {
          model: db.User,
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
