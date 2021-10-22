const express = require("express");
const router = express.Router();
const { Group, User, UserGroup } = require("../../models/modelHelper");
const { authenticateToken } = require("../../auth/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.send({ groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'groupUsers' 
        },
      ],
    });
    res.send({ group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({
      message: "name is required",
    });
    return;
  }

  const data = {
    name: req.body.name,
  };

  try {
    const newGroup = await Group.create(data);
    newGroup.setDataValue('groupUsers', []);
    newGroup.setDataValue('createdAt', new Date());
    res.send({ group: newGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    const data = {
      ...req.body,
    }

    const updated = await group.update(data);

    await UserGroup.destroy({ where: { groupId: req.params.id } });
    for (const userId of data.users) {
      await UserGroup.create({ groupId: req.params.id, userId });
    }

    res.send({group: updated});
  } catch (e) {
    if (e.errors.length > 0) {
      res.status(500).json({ message: e.errors[0].message });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Group.remove({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;