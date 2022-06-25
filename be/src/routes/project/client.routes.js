const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const {
  authenticateToken,
  getUser,
  getCompanyKey,
} = require("../../auth/auth");
const { validator } = require("../../service");
const { ROLE } = require("../../../enum/enum");
const { responseError } = require("../../service/utils");
const { getDatabaseModels } = require("../../models");

router.get("/", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({ message: req.t("error.accessDenied") });
    return;
  }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const clients = await db.Client.findAndCountAll({
      where: {
        name: {
          [Op.like]: req.query.name ? `%${req.query.name}%` : "%",
        },
      },
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "name",
          req.query.sort ? req.query.sort : "ASC",
        ],
      ],
    });
    res.json({ clients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({ message: req.t("error.accessDenied") });
    return;
  }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const client = await db.Client.findByPk(req.params.id, {
      include: [{ model: db.Project, as: "projects" }],
    });

    if (!client) {
      res.status(404).json({});
      return;
    }

    res.json({ success: true, client });
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

  const requiredAttr = ["name"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }

  const data = req.body;

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const newRecord = await db.Client.create(data);
    res.send({ success: true, client: newRecord });
  } catch (error) {
    responseError(req, res, error);
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
    const client = await db.Client.findByPk(req.params.id);
    if (!client) {
      res.status(404).json({});
      return;
    }

    const updated = await client.update(req.body);

    res.json({ success: true, client: updated });
  } catch (error) {
    responseError(req, res, error);
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
    const client = await db.Client.findByPk(req.params.id);
    await client.destroy();

    res.json({ success: true, message: "Success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
