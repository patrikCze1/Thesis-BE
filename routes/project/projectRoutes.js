const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Project, User, Group, Client } = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require('../../service');
const { projectRepo } = require('./../../repo');

router.get('/', authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  
  try {
    const filter =  req.query;
    const projects = await projectRepo.findByUser(user, filter);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const projects = await projectRepo.findByUser(user, {});
    const result = projects.find(project => project.id == req.params.id);
    if (!result) res.status(403).json({ message: 'Uživatel nemá přístup k tomuto projektu.' });

    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client }, 
        { model: User, as: 'creator' }, 
      ],
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const requiredAttr = ['name'];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(', '),
    });
    return;
  }

  const data = {
    name: req.body.name,
  };

  const newProject = await Project.create(data);
  res.send(newProject);
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    let project = await Project.findByPk(req.params.id);
    
    project.title = req.body.title;
    project.description = req.body.description;
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
  //console.log(project.changed())
});

router.delete("/:id", authenticateToken, async (req, res) => {
  //todo remove all task attach and comment attach
  try {
    const removedProject = await Project.remove({ id: req.params.id });
    res.json(removedProject);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
});

module.exports = router;
