const express = require("express");
const router = express.Router();
const { Project, Task } = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { projectRepo } = require("./../../repo");
const ac = require("./../../security");

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  let projects;
  let tasks;
  try {
    const { query } = req.query;
    projects = await projectRepo.findBySearch(user, query);
    tasks = await Task.findAll({
      where: {
        [Op.like]: query,
        //todo user in tasks
      },
    });

    res.json({ success: true, projects, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
