const express = require("express");
const router = express.Router();

const { Project, ProjectStage } = require("../../models/modelHelper");
const { authenticateToken, getUser } = require("../../auth/auth");
const { validator } = require("../../service");
const { SOCKET_EMIT, ROLE } = require("../../enum/enum");
const { getIo } = require("../../service/io");

const io = getIo();

router.post("/:projectId/stages", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({ message: "Nedostatečné oprávnění" });
    return;
  }

  const requiredAttr = ["name"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      success: false,
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }

  const data = {
    name: req.body.name,
    order: req.body.order,
    projectId: req.params.projectId,
  };

  try {
    const stage = await ProjectStage.create(data);
    io.emit(SOCKET_EMIT.PROJECT_STAGE_NEW, { stage });
    res.json({ stage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:projectId/stages", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({ message: "Nedostatečné oprávnění" });
    return;
  }

  try {
    const { stages } = req.body;

    for (const stage of stages) {
      await ProjectStage.update(stage, { where: { id: stage.id } });
    }
    io.emit(SOCKET_EMIT.PROJECT_STAGE_EDIT, {
      projectId: req.params.projectId,
      stages,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/stages/:id", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({ message: "Nedostatečné oprávnění" });
    return;
  }

  const { id } = req.params;
  try {
    await ProjectStage.destroy({ where: { id } });

    io.emit(SOCKET_EMIT.PROJECT_STAGE_DELETE, { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
