const express = require("express");
const router = express.Router();
const { Task, TaskCheck } = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");
const ac = require("./../../security");

router.post("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  const permission = ac.can(user.role).createAny("taskCheck");

  if (!permission.granted) {
    res.status(403).json({ success: false });
    return;
  }

  const requiredAttr = ["title"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }

  const data = req.body;

  try {
    const newRecord = await TaskCheck.create(data);
    res.send({ success: true, check: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const check = await TaskCheck.findByPk(req.params.id);

    const data = req.body;

    if (check.completed === false && data.completed === true) {
      data.solverId = user.id;
    } else if (check.completed != data.completed) {
      data.solverId = null;
    }
    const updated = await check.update(data); //completed by

    res.json({ success: true, check: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const check = await TaskCheck.findByPk(req.params.id);
    const user = getUser(req, res);
    const permission =
      check.createdById == user.id
        ? ac.can(user.role).deleteOwn("taskCheck")
        : ac.can(user.role).deleteAny("taskCheck");
    if (!permission.granted) {
      res.status(403).json({ success: false });
      return;
    }

    await check.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
