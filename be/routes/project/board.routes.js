const express = require("express");
const router = express.Router();
const { Board, Stage } = require("../../models/modelHelper");
const {
  getUser,
  authenticateToken,
  managementAccessOnly,
} = require("../../auth/auth");
const { validator } = require("../../service");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT, ROLE, STAGE_TYPE } = require("../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");

router.get("/:projectId/boards", authenticateToken, async (req, res) => {
  try {
    const boards = await Board.findAll({
      where: { projectId: req.params.projectId },
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "createdAt",
          req.query.sort ? req.query.sort : "DESC",
        ],
      ],
    });
    res.json({ boards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/:projectId/boards/:boardId",
  authenticateToken,
  async (req, res) => {
    try {
      const board = await Board.findByPk(req.params.boardId);
      const stages = await Stage.findAll({
        where: { boardId: req.params.boardId },
      });
      res.json({ board, stages });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/:projectId/boards",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    const currentUser = getUser(req, res);
    const { projectId } = req.params;

    const requiredAttr = ["name"];
    const result = validator.validateRequiredFields(requiredAttr, req.body);
    if (!result.valid) {
      res.status(400).json({
        message:
          req.t("error.theseFieldsAreRequired") +
          result.requiredFields
            .map((field) => req.t(`field.${field}`))
            .join(", "),
      });
      return;
    }

    const data = {
      ...req.body,
      createdById: currentUser.id,
      projectId,
    };

    try {
      const board = await Board.create(data);

      Stage.create({
        name: req.t("stage.todo"),
        order: 1,
        projectId,
        boardId: board.id,
      });
      Stage.create({
        name: req.t("stage.workInProgress"),
        order: 2,
        projectId,
        boardId: board.id,
        type: STAGE_TYPE.IN_PROGRESS,
      });
      Stage.create({
        name: req.t("stage.complete"),
        order: 3,
        projectId,
        boardId: board.id,
        type: STAGE_TYPE.COMPLETED,
      });

      res.json({ board });

      const projectUsers = await findUsersByProject(board.projectId);
      for (const u of projectUsers) {
        if (u.id !== user.id) io.to(u.id).emit(SOCKET_EMIT.BOARD_NEW, { task });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:projectId/boards/:boardId",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    try {
      const data = req.body;
      const b = await Board.findByPk(req.params.boardId);

      const board = await b.update(data);

      res.json({ board });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/boards/:boardId",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    try {
      const board = await Board.findByPk(req.params.boardId);
      if (!board) {
        res
          .status(404)
          .json({ message: req.t("board.error.boardDoesNotExist") });
        return;
      }

      await board.destroy();

      //   io.emit(SOCKET_EMIT.PROJECT_DELETE, { id: req.params.id });
      res.json({ message: req.t("board.message.deleted") });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
