const express = require("express");
const router = express.Router();

const {
  Project,
  User,
  Client,
  Stage,
  ProjectGroup,
  ProjectUser,
  Group,
  Board,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");
const { projectRepo } = require("./../../repo");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT, ROLE, STAGE_TYPE } = require("../../../enum/enum");
const { responseError } = require("../../service/utils");
const { isUserInProject } = require("../../repo/project/project.repository");

const io = getIo();

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  let projects;
  try {
    const filter = req.query;
    // only admin can see all projects
    if (user.roles.includes(ROLE.ADMIN)) {
      projects = await Project.findAndCountAll({
        include: [
          {
            model: Client,
          },
          { model: User, as: "creator" },
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

    res.json({ ...projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    if (!user.roles.includes(ROLE.ADMIN)) {
      // only admin can see all projects
      const result = await isUserInProject(req.params.id, user.id);

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
        { model: Group, as: "groups" },
        { model: User, as: "users" },
      ],
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
        result.requiredFields
          .map((field) => req.t(`field.${field}`))
          .join(", "),
    });
    return;
  }

  const data = {
    ...req.body,
    createdById: user.id,
  };
  console.log("data", data);
  try {
    const io = getIo();
    const project = await Project.create(data);
    const board = await Board.create({
      projectId: project.id,
      name: project.name,
    });

    await Stage.create({
      name: req.t("stage.todo"),
      order: 1,
      projectId: project.id,
      boardId: board.id,
      type: STAGE_TYPE.WAITING,
    });
    await Stage.create({
      name: req.t("stage.workInProgress"),
      order: 2,
      projectId: project.id,
      boardId: board.id,
      type: STAGE_TYPE.IN_PROGRESS,
    });
    await Stage.create({
      name: req.t("stage.complete"),
      order: 3,
      projectId: project.id,
      boardId: board.id,
      type: STAGE_TYPE.COMPLETED,
    });

    for (let groupId of req.body.groups) {
      await ProjectGroup.create({ projectId: project.id, groupId });
    }

    for (let userId of req.body.users) {
      await ProjectUser.create({ projectId: project.id, userId });
    }

    if (data.clientId) {
      project.setDataValue("Client", await Client.findByPk(data.clientId));
    }
    if (data.users) project.setDataValue("users", data.users);
    if (data.groups) project.setDataValue("users", data.groups);
    project.setDataValue("creator", user);

    res.json({ project });

    for (let userId of req.body.users) {
      io.to(userId).emit(SOCKET_EMIT.PROJECT_NEW, { project });
    }
  } catch (error) {
    responseError(req, res, error);
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
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }
    const data = {
      ...req.body,
      clientId: req.body.clientId || null,
    };

    const updated = await project.update(data);

    if (data.clientId) {
      updated.setDataValue("Client", await Client.findByPk(data.clientId));
    }

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
    responseError(req, res, error);
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
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }

    await project.destroy();

    io.emit(SOCKET_EMIT.PROJECT_DELETE, { id: req.params.id });
    res.json({ message: req.t("project.message.projectDeleted") });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
