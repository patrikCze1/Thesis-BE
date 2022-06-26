const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  getUser,
  managementAccessOnly,
  getCompanyKey,
} = require("../../auth/auth");
const { validator } = require("../../service");
const { SOCKET_EMIT, ROLE } = require("../../../enum/enum");
const { getIo } = require("../../service/io");
const { findUsersByProject } = require("../../repo/userRepo");
const { responseError } = require("../../service/utils");
const { getDatabaseModels, getDatabaseConnection } = require("../../models");

const io = getIo();

router.post(
  "/:boardId/stages",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
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
      const ck = getCompanyKey(req);
      const db = getDatabaseModels(ck);
      const stage = await db.Stage.create(data);
      const board = await db.Board.findByPk(req.params.boardId);
      const conn = getDatabaseConnection(ck);
      const projectUsers = await findUsersByProject(conn, board.projectId);

      res.json({ stage });

      for (const u of projectUsers) {
        io.to(u.id).emit(SOCKET_EMIT.BOARD_STAGE_NEW, { stage });
      }
    } catch (error) {
      responseError(req, res, error);
    }
  }
);

router.patch(
  "/:boardId/stages",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    try {
      const ck = getCompanyKey(req);
      const db = getDatabaseModels(ck);
      const { stages } = req.body;

      for (const stage of stages) {
        if (stage.limit < 1) stage.limit = null;
        await db.Stage.update(stage, {
          where: { id: stage.id, boardId: req.params.boardId },
        });
      }

      const board = await db.Board.findByPk(req.params.boardId);
      const conn = getDatabaseConnection(ck);
      const projectUsers = await findUsersByProject(conn, board.projectId);

      res.json({ stages });

      for (const u of projectUsers) {
        io.to(u.id).emit(SOCKET_EMIT.BOARD_STAGE_EDIT, {
          boardId: req.params.boardId,
          stages,
        });
      }
    } catch (error) {
      responseError(req, res, error);
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
      message: req.t("error.missingPermissionForAction"),
    });
    return;
  }

  const { id } = req.params;
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    await db.Stage.destroy({ where: { id } });
    res.json({ success: true });

    io.emit(SOCKET_EMIT.BOARD_STAGE_DELETE, { id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
