const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  getUser,
  getCompanyKey,
} = require("../../auth/auth");
const { ROLE } = require("../../../enum/enum");
const { responseError } = require("../../service/utils");
const { getDatabaseModels } = require("../../models");

router.get("/", authenticateToken, async (req, res) => {
  const where = {};

  if (req.query.userId)
    where["$groupUsers.UserGroup.userId$"] = req.query.userId;
  // for (const key in req.query) {
  //   if (req.query[key]) where[key] = req.query[key];
  // }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const groups = await db.Group.findAll({
      where,
      include: [
        {
          model: db.User,
          as: "groupUsers",
          attributes: [],
        },
      ],
    });
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const group = await db.Group.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          as: "groupUsers",
        },
      ],
    });
    res.json({ group });
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

  if (!req.body.name) {
    res.status(400).json({
      message:
        `${req.t("error.thisFieldsAreRequired")}: ` +
        ["name"].map((field) => req.t(`field.${field}`)).join(", "),
    });
    return;
  }

  const data = {
    name: req.body.name,
  };

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);

    const newGroup = await db.Group.create(data);
    newGroup.setDataValue("groupUsers", []);
    newGroup.setDataValue("createdAt", new Date());
    res.json({ group: newGroup });
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
    const group = await db.Group.findByPk(req.params.id);

    const data = {
      ...req.body,
    };

    const updated = await group.update(data);

    await db.UserGroup.destroy({ where: { groupId: req.params.id } });
    for (const userId of data.users) {
      await db.UserGroup.create({ groupId: req.params.id, userId });
    }

    res.json({ group: updated });
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
    await db.Group.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
