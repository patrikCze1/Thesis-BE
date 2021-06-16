const express = require("express");
const router = express.Router();
const { Project, User, ProjectUser, ProjectGroup, Group } = require("../../models/modelHelper");
const { getUser } = require("../../auth/auth");

router.get('/', async (req, res) => {
  const user = getUser(req, res);
  
  try {
    const projects = await Project.findAll({
      where: {
        '$User.id$': user.id,
      },
      include: [
        // {model: ProjectGroup },
        // {model: Group },
        // {model: ProjectUser },
        {
          model: User,
          as: 'user',
          // through: { where: { userId: user.id } },
          // userId: user.id,
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
    res.json({ message: error.message });
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
