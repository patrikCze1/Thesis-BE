const express = require("express");
const router = express.Router();
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const sequelize = require("./../../models/index");
const { authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");

const {
  User,
  TimeTrack,
  UserGroup,
  ProjectUser,
  Group,
  Project,
} = require("../../models/modelHelper");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
      order: [
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
    const users = await sequelize.query(
      `
    SELECT DISTINCT User.* FROM Users AS User 
    LEFT JOIN ProjectUsers AS pu ON User.id = pu.userId 
    LEFT JOIN UserGroups AS ug ON User.id = ug.userId
    LEFT JOIN Groups AS g ON g.id = ug.groupId
    LEFT JOIN ProjectGroups AS pg ON g.id = pg.groupId
    LEFT JOIN Projects AS p ON p.id = :projectId
    WHERE User.active = true AND (pu.projectId = :projectId OR pg.projectId = :projectId OR p.createdById = User.id)
    ORDER BY User.lastName ASC
    `,
      {
        model: User,
        replacements: { projectId: req.params.id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:userId/tracks", authenticateToken, async (req, res) => {
  try {
    const items = await TimeTrack.findAll({
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
  const requiredAttr = ["username", "email", "password"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).json({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const data = req.body;
    data.password = hashedPassword;
    data.shortName = `${data.lastName.charAt(0).toUpperCase()}${data.firstName
      .charAt(0)
      .toUpperCase()}`;

    const savedUser = await User.create(data);

    res.json({ user: savedUser });
  } catch (e) {
    if (e.errors.length > 0) {
      res.status(500).json({ message: e.errors[0].message });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    let user = await User.findByPk(req.params.id);

    const data = {
      ...req.body,
    };

    const updated = await user.update(data);

    res.json({ user: updated });
  } catch (e) {
    if (e.errors.length > 0) {
      res.status(500).json({ message: e.errors[0].message });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  //nemazat jen deaktivovat
  try {
    let removedUser = await User.findByPk(req.params.id);

    removedUser.active = false;
    await removedUser.save();

    res.json(removedUser);
    // todo remove all users records...
    await UserGroup.destroy({ where: { userId: req.params.id } });
    await ProjectUser.destroy({ where: { userId: req.params.id } });

    // const removedUser = await User.remove({ id: req.params.id });
    // res.json(removedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;