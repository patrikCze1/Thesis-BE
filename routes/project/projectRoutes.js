const express = require("express");
const router = express.Router();
const { Project, User, Client, ProjectStage } = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require('../../service');
const { projectRepo } = require('./../../repo');
const ac = require('./../../security');
const { projectState } = require("../../models/constantHelper");

router.get('/', authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  const permission = ac.can(user.role).readOwn('project');

  if (!permission.granted) {
    res.status(403).json({ success: false });
    return;
  }
  
  try {
    const filter =  req.query;
    const projects = await projectRepo.findByUser(user, filter);
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const projects = await projectRepo.findByUser(user, {});
    const result = projects.find(project => project.id == req.params.id);
    if (!result) res.status(403).json({ success: false, message: 'Uživatel nemá přístup k tomuto projektu.' });

    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client }, 
        { model: User, as: 'creator' }, 
        { model: ProjectStage, as: 'projectStages' }, 
      ],
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Projekt neexistuje' });
      return;
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  const permission = ac.can(user.role).createAny('project');

  if (!permission.granted) {
    res.status(403).json({ success: false });
    return;
  }

  const requiredAttr = ['name'];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      success: false,
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(', '),
    });
    return;
  }

  const data = {
    name: req.body.name,
    createdById: user.id,
    status: req.body.status,
  };

  try {
    const newProject = await Project.create(data);
    res.send({ success: true, peoject: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    
    const updated = await project.update({status: projectState.STATUS_COMPLETED});

    res.json({ success: true, project: updated});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Projekt neexistuje' });
      return;
    }

    const permission = project.createdById == user.id ? ac.can(user.role).updateOwn('project') : ac.can(user.role).updateAny('project');

    if (!permission.granted) {
      res.status(403).json({ success: false });
      return;
    }
    
    const updated = await project.update(req.body);

    res.json({ success: true, project: updated});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => { // todo role
  const user = getUser(req, res);

  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Projekt neexistuje' });
      return;
    }

    const permission = project.createdById == user.id ? ac.can(user.role).deleteOwn('project') : ac.can(user.role).deleteAny('project');

    if (!permission.granted) {
      res.status(403).json({ success: false });
      return;
    }

    await project.destroy(); // soft delete (paranoid)

    res.json({ success: true, message: 'Projekt smazán'});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
