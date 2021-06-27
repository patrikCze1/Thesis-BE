const { Project, User, Group, Client } = require("../../models/modelHelper");
const { Op } = require("sequelize");

/**
 * 
 */
exports.findByUser = async (user, filter) => {
    return await Project.findAll({
        // attributes: { exclude: ['user'] },
        where: {
          [Op.or]: [
            { '$User.id$': user.id },
            { '$group->groupUser.id$': user.id },
          ],
        },
        include: [
          {
            model: Group,
            as: 'group',
            attributes: [],
            include: {
              model: User,
              as: 'groupUser',
              attributes: [],
            }
          },
          {
            model: User,
            as: 'user',
            attributes: [], // dont select users fields
          },
        ],
        limit: filter.limit ? parseInt(filter.limit) : null,
        offset: filter.page ? parseInt(filter.page) : 0,
        order: [
          [
            filter.orderBy ? filter.orderBy : 'name', 
            filter.sort ? filter.sort : 'ASC',
          ]
        ]
      });
}