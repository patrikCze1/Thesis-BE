const express = require("express");
const router = express.Router();
const {
  Project,
  User,
  Client,
  ProjectStage,
  ProjectGroup,
  ProjectUser,
  Group,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");
const { projectRepo } = require("./../../repo");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT, ROLE } = require("../../enum/enum");

const io = getIo();

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  let projects;
  try {
    const filter = req.query;
    // only admin can see all projects
    if (user.roles.includes(ROLE.ADMIN)) {
      projects = await Project.findAll({
        include: [
          {
            model: Client,
          },
        ],
        limit: filter.limit ? parseInt(filter.limit) : null,
        offset: filter.offset ? parseInt(filter.offset) : 0,
        order: [
          [
            filter.orderBy ? filter.orderBy : "name",
            filter.sort ? filter.sort : "ASC",
          ],
        ],
      });
    } else {
      projects = await projectRepo.findByUser(user, filter);
    }

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    if (!user.roles.includes(ROLE.ADMIN)) {
      // only admin can see all projects
      const userProjects = await projectRepo.findByUser(user, {});
      const result = userProjects.find(
        (project) => project.id == req.params.id
      );

      if (!result) {
        res.status(403).json({
          message: req.t("project.error.userHasNotAccessToThisProject"),
        });
        return;
      }
    }

    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client },
        { model: User, as: "creator" },
        { model: ProjectStage, as: "projectStages" },
        { model: Group, as: "groups" },
        { model: User, as: "users" },
      ],
      order: [[{ model: ProjectStage, as: "projectStages" }, "order", "ASC"]],
    });

    if (!project) {
      res
        .status(404)
        .json({ message: req.t("project.error.projectDoesNotExist") });
      return;
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  if (
    !user.roles.includes(ROLE.ADMIN) &&
    !user.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({ message: req.t("error.insufficientPermissions") });
    return;
  }

  const requiredAttr = ["name"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).json({
      message:
        req.t("error.theseFieldsAreRequired") +
        result.requiredFields.join(", "),
    });
    return;
  }

  const data = {
    name: req.body.name,
    description: req.body.description,
    createdById: user.id,
    status: req.body.status,
    clientId: req.body.client,
  };

  try {
    const newProject = await Project.create(data);

    for (let groupId of req.body.groups) {
      await ProjectGroup.create({ projectId: newProject.id, groupId });
    }

    for (let userId of req.body.users) {
      await ProjectUser.create({ projectId: newProject.id, userId });
      io.to(userId).emit(SOCKET_EMIT.PROJECT_NEW, { project: newProject });
    }

    //todo notifikace, prirazeni k projektu

    res.json({ project: newProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      res
        .status(404)
        .json({ message: req.t("project.error.projectDoesNotExist") });
      return;
    }

    if (
      !user.roles.includes(ROLE.ADMIN) &&
      !user.roles.includes(ROLE.MANAGEMENT)
    ) {
      res.status(403).json({ success: false });
      return;
    }
    const data = {
      ...req.body,
      clientId: req.body.client,
    };

    const updated = await project.update(data);

    await ProjectGroup.destroy({ where: { projectId: project.id } });
    await ProjectUser.destroy({ where: { projectId: project.id } });

    for (let groupId of req.body.groups) {
      await ProjectGroup.create({ projectId: project.id, groupId });
      //todo socket
    }

    for (let userId of req.body.users) {
      await ProjectUser.create({ projectId: project.id, userId });
      io.to(userId).emit(SOCKET_EMIT.PROJECT_EDIT, { project: updated });
    }

    //todo notifikace, prirazeni/obrani projektu

    res.json({ project: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      res
        .status(404)
        .json({ message: req.t("project.error.projectDoesNotExist") });
      return;
    }

    if (
      !user.roles.includes(ROLE.ADMIN) &&
      !user.roles.includes(ROLE.MANAGEMENT)
    ) {
      res.status(403).json({ success: false });
      return;
    }

    await project.destroy(); // soft delete (paranoid)

    io.emit(SOCKET_EMIT.PROJECT_DELETE, { id: req.params.id });
    res.json({ message: req.t("project.message.projectDeleted") });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
