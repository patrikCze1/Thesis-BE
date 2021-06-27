const express = require("express");
const router = express.Router();
const { Group, User } = require("../../models/modelHelper");
const { authenticateToken } = require("../../auth/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        {model: User},
      ],
    });
    res.json(group);
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
    res.send(newGroup);
  } catch (error) {
    res.status(500).send({message: error.message});
  }
});

module.exports = router;