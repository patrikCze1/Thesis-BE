const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Project, User, Group } = require("../../models/modelHelper");
const { getUser } = require("../../auth/auth");
const { validator } = require('../../service');

router.get('/', async (req, res) => {
  const user = getUser(req, res);
  
  try {
    const projects = await Project.findAll({
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
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : 'name', 
          req.query.sort ? req.query.sort : 'ASC',
        ]
      ]
    });
    res.json(projects);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(500);
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
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

router.patch("/:id", async (req, res) => {
  try {
    let project = await Project.findByPk(req.params.id);
    
    project.title = req.body.title;
    project.description = req.body.description;
    await project.save();

    res.json(project);
  } catch (error) {
    res.json({ message: error.message });
  }
  //console.log(project.changed())
});

router.delete("/:id", async (req, res) => {
  //todo remove all task attach and comment attach
  try {
    const removedProject = await Project.remove({ id: req.params.id });
    res.json(removedProject);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
