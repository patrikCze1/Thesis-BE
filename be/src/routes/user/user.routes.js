const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  getUser,
  getCompanyKey,
} = require("../../auth/auth");
const { validator } = require("../../service");

const { findUsersByProject } = require("../../repo/userRepo");
const { ROLE } = require("../../../enum/enum");
const { responseError } = require("../../service/utils");
const { createHashedPassword } = require("../../service/user.service");
const { getDatabaseModels, getDatabaseConnection } = require("../../models");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const where = {};

    if (req.query.withDeactivated !== "true") where.deactivated = false;
    const users = await db.User.findAll({
      where,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
      order: [
        ["deactivated", "ASC"],
        [
          req.query.orderBy ? req.query.orderBy : "lastName",
          req.query.sort ? req.query.sort : "ASC",
        ],
      ],
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * get all users assigned to project
 */
router.get("/project/:id", authenticateToken, async (req, res) => {
  try {
    const ck = getCompanyKey(req);
    const conn = getDatabaseConnection(ck);
    const users = await findUsersByProject(conn, req.params.id);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const user = await db.User.findByPk(req.params.id);

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:userId/tracks", authenticateToken, async (req, res) => {
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const items = await db.TimeTrack.findAll({
      where: {
        UserId: req.params.userId,
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({
      message: req.t("error.missingPermissionForAction"),
    });
    return;
  }

  const requiredAttr = ["username", "email", "password"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).json({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }
  //todo set role if role is empty
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const hashedPassword = await createHashedPassword(req.body.password);
    const data = req.body;
    data.password = hashedPassword;

    const savedUser = await db.User.create(data);

    res.json({ user: savedUser });
  } catch (e) {
    responseError(req, res, e);
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({
      message: req.t("error.missingPermissionForAction"),
    });
    return;
  }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const user = await db.User.findByPk(req.params.id);
    const updated = await user.update({ ...req.body });

    res.json({ user: updated });
  } catch (e) {
    responseError(req, res, e);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({
      message: req.t("error.missingPermissionForAction"),
    });
    return;
  }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const removedUser = await db.User.findByPk(req.params.id);
    console.log("removedUser", removedUser);

    await removedUser.destroy();

    await db.UserGroup.destroy({ where: { userId: req.params.id } });
    await db.ProjectUser.destroy({ where: { userId: req.params.id } });

    res.json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
