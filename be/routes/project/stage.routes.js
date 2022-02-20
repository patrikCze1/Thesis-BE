const express = require("express");
const router = express.Router();

const { Project, Stage } = require("../../models/modelHelper");
const {
  authenticateToken,
  getUser,
  managementAccessOnly,
} = require("../../auth/auth");
const { validator } = require("../../service");
const { SOCKET_EMIT, ROLE } = require("../../enum/enum");
const { getIo } = require("../../service/io");

const io = getIo();

router.post(
  "/:boardId/stages",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    const currentUser = getUser(req, res);

    const requiredAttr = ["name"];
    const result = validator.validateRequiredFields(requiredAttr, req.body);
    if (!result.valid) {
      res.status(400).send({
        message:
          req.t("error.theseFieldsAreRequired") +
          result.requiredFields
            .map((field) => req.t(`field.${field}`))
            .join(", "),
      });
      return;
    }

    const data = {
      name: req.body.name,
      order: req.body.order,
      boardId: req.params.boardId,
    };

    try {
      const stage = await Stage.create(data);
      res.json({ stage });

      io.emit(SOCKET_EMIT.BOARD_STAGE_NEW, { stage });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:boardId/stages",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    try {
      const { stages } = req.body;

      for (const stage of stages) {
        if (stage.limit < 1) stage.limit = null;
        await Stage.update(stage, {
          where: { id: stage.id, boardId: req.params.boardId },
        });
      }

      res.json({ success: true });

      io.emit(SOCKET_EMIT.BOARD_STAGE_EDIT, {
        boardId: req.params.boardId,
        stages,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete("/stages/:id", authenticateToken, async (req, res) => {
  const currentUser = getUser(req, res);

  if (
    !currentUser.roles.includes(ROLE.ADMIN) &&
    !currentUser.roles.includes(ROLE.MANAGEMENT)
  ) {
    res.status(403).json({
      message: req.json({
        message: req.t("error.missingPermissionForAction"),
      }),
    });
    return;
  }

  const { id } = req.params;
  try {
    await Stage.destroy({ where: { id } });

    io.emit(SOCKET_EMIT.BOARD_STAGE_DELETE, { id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
