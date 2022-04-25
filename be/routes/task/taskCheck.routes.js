const express = require("express");
const router = express.Router();

const { Task, TaskCheck } = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");
const { responseError } = require("../../service/utils");
const { ROLE } = require("../../enum/enum");

router.post("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

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
    responseError(req, res, error);
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
    responseError(req, res, error);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const check = await TaskCheck.findByPk(req.params.id);
    const task = await Task.findByPk(check.taskId);
    const user = getUser(req, res);

    if (
      !task.createdById !== user.id &&
      !user.roles.includes(ROLE.ADMIN) &&
      !user.roles.includes(ROLE.MANAGEMENT)
    ) {
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }

    await check.destroy();
    res.json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
