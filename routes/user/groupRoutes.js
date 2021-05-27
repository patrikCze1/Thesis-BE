const express = require("express");
const router = express.Router();
const { Group } = require("../../models/modelHelper");

router.get("/", async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    res.json(group);
  } catch (error) {
    res.json({ message: error.message });
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

  const newGroup = await Group.create(data);
  res.send(newGroup);
});

module.exports = router;