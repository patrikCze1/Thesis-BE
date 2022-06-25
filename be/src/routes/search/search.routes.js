const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const {
  getUser,
  authenticateToken,
  getCompanyKey,
} = require("../../auth/auth");
const { projectRepo } = require("./../../repo");

const { ROLE } = require("../../../enum/enum");
const { getDatabaseModels } = require("../../models");

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  let projects = [];
  let tasks = [];
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const { query } = req.query;
    // todo test
    if (user.roles.includes(ROLE.ADMIN)) {
      projects = await db.Project.findAll({
        where: {
          name: {
            [Op.like]: `%${query}%`,
          },
        },
      });
    } else {
      projects = await projectRepo.findBySearch(db, user, query, {
        limit: 10000,
        offset: 0,
      });
    }
    let tasksWhere = {
      name: {
        [Op.like]: `%${query}%`,
      },
    };
    if (!user.roles.includes(ROLE.ADMIN)) {
      tasksWhere = {
        ...tasksWhere,
        [Op.or]: [
          { "$project->users->ProjectUser.userId$": user.id },
          { "$project->groups->groupUsers->UserGroup.userId$": user.id },
          { "$project.createdById$": user.id },
          { createdById: user.id },
        ],
      };
    }
    tasks = await db.Task.findAll({
      where: tasksWhere,
      include: [
        {
          model: db.Project,
          as: "project",
          attributes: [],
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
        },
      ],
    });

    res.json({ tasks, projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
