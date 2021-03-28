const { request } = require("express");
const express = require("express");
const router = express.Router();
const db = require("../../models/index");
const Project = db.Project;

router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    res.json(project);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({
      message: "name is required",
    });
    return;
  }

  const data = {
    name: req.body.name,
  };

  const newProject = await Project.create(data);
  res.send(newProject);
});

router.patch("/:id", async (req, res) => {
  try {
    let project = await Project.findByPk(req.params.id);
    
    project.title = req.body.title;
    project.description = req.body.description;
    await project.save();

    res.json(project);
  } catch (error) {
    res.json({ message: error });
  }
  //console.log(project.changed())
});

router.delete("/:id", async (req, res) => {
  try {
    const removedProject = await Project.remove({ id: req.params.id });
    res.json(removedProject);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
