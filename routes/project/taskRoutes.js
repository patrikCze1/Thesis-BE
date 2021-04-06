const express = require("express");
const router = express.Router();
const Task = require("../../models/modelHelper");

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

router.get("/tasks/:id", async (req, res) => {
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

router.patch("/tasks/:id", async (req, res) => {
  try {
    let task = await Task.findByPk(req.params.id);
    
    task.title = req.body.title;
    task.description = req.body.description;
    task.status = req.body.status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.json({ message: error });
  }
  //console.log(task.changed())
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const removedTask = await Task.remove({ id: req.params.id });
    res.json(removedTask);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
