const express = require("express");
const router = express.Router();
const { Project, Task, User, Group } = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { projectRepo } = require("./../../repo");

const { Op } = require("sequelize");
const { ROLE } = require("../../../enum/enum");

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  let projects = [];
  let tasks = [];
  try {
    const { query } = req.query;
    // todo test
    if (user.roles.includes(ROLE.ADMIN)) {
      projects = await Project.findAll({
        where: {
          name: {
            [Op.like]: `%${query}%`,
          },
        },
      });
    } else {
      projects = await projectRepo.findBySearch(user, query, {
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
    tasks = await Task.findAll({
      where: tasksWhere,
      include: [
        {
          model: Project,
          as: "project",
          attributes: [],
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
        },
      ],
    });

    res.json({ tasks, projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
