const express = require("express");
const router = express.Router();
const { Project, Task, User, Group } = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { projectRepo } = require("./../../repo");
const ac = require("./../../security");
const { Op } = require("sequelize");

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  let projects;
  let tasks;
  try {
    const { query } = req.query;
    // todo test
    projects = await projectRepo.findBySearch(user, query);
    tasks = await Task.findAll({
      where: {
        [Op.or]: [
          { "$project->users->ProjectUser.userId$": user.id },
          { "$project->groups->groupUsers->UserGroup.userId$": user.id },
          { "$project.createdById$": user.id },
          { createdById: user.id },
        ],
        title: {
          [Op.like]: `%${query}%`,
        },
      },
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
    // console.log(tasks);
    res.json({ tasks, projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
