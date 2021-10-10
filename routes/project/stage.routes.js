const express = require("express");
const router = express.Router();
const { Project, ProjectStage } = require("../../models/modelHelper");
const { authenticateToken } = require("../../auth/auth");
const { validator } = require("../../service");

router.post("/:projectId/stages", authenticateToken, async (req, res) => {
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

    res.send({ success: true, stage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:projectId/stages", authenticateToken, async (req, res) => {
  try {
    const { stages } = req.body;
    console.log(stages);

    for (const stage of stages) {
      await ProjectStage.update(stage, { where: { id: stage.id } });
    }
    res.send({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/stages/:id", authenticateToken, async (req, res) => {
  try {
    await ProjectStage.destroy({ where: { id: req.params.id } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
