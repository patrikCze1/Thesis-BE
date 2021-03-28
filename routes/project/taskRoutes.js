const express = require("express");
const router = express.Router();
const db = require("../../models");
const Task = db.Task;
const Project = db.Project;

router.get("/:projectId/tasks/", async (req, res) => {
  try {
    // const project = await Project.findByPk(req.params.projectId);
    const tasks = await Task.findAll({
      where: {
        ProjectId: req.params.projectId,
      },
    });
    res.json(tasks);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    res.json(task);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/:projectId/tasks/", async (req, res) => {
  if (!req.body.title) {
    res.status(400).send({
      message: "title is required",
    });
    return;
  }

  const data = {
    title: req.body.title,
    ProjectId: req.params.projectId,
  };

  try {
    const newItem = await Task.create(data);
    res.send(newItem);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
