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
const { SOCKET_EMIT, ROLE, STAGE_TYPE } = require("../../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");
const { responseError } = require("../../service/utils");
const { isUserInProject } = require("../../repo/project/project.repository");
const sequelize = require("../../models");

router.get("/:projectId/boards", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const allowEntry = await isUserInProject(req.params.projectId, user.id);
    if (!allowEntry && !user.roles.includes(ROLE.ADMIN)) {
      res.status(403).json({
        message: req.t("project.error.userHasNotAccessToThisProject"),
      });
      return;
    }

    const boards = await Board.findAll({
      where: { projectId: req.params.projectId },
      order: [
        [sequelize.fn("isnull", sequelize.col("beginAt")), "DESC"],
        ["beginAt", "DESC"],
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
    const user = getUser(req, res);

    try {
      const allowEntry = await isUserInProject(req.params.projectId, user.id);
      if (!allowEntry && !user.roles.includes(ROLE.ADMIN)) {
        res.status(403).json({
          message: req.t("project.error.userHasNotAccessToThisProject"),
        });
        return;
      }

      const board = await Board.findByPk(req.params.boardId);
      const stages = await Stage.findAll({
        where: { boardId: req.params.boardId },
        order: [["order", "ASC"]],
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

    const data = {
      ...req.body,
      createdById: currentUser.id,
      projectId,
    };

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
    } else if ((data.beginAt && !data.endAt) || (!data.beginAt && data.endAt)) {
      res.status(400).json({
        message: req.t("error.validation.fillBothDates"),
      });
      return;
    }

    try {
      const socket = getIo();
      const board = await Board.create(data);
      console.log("board", board);
      Stage.create({
        name: req.t("stage.todo"),
        order: 1,
        projectId,
        boardId: board.id,
        type: STAGE_TYPE.WAITING,
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

      const projectUsers = await findUsersByProject(projectId);

      res.json({ board });

      for (const u of projectUsers) {
        socket.to(u.id).emit(SOCKET_EMIT.PROJECT_BOARD_NEW, { board });
      }
    } catch (error) {
      responseError(req, res, error);
    }
  }
);

router.patch(
  "/:projectId/boards/:boardId",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    const data = req.body;
    if ((data.beginAt && !data.endAt) || (!data.beginAt && data.endAt)) {
      res.status(400).json({
        message: req.t("error.validation.fillBothDates"),
      });
      return;
    }

    try {
      const b = await Board.findByPk(req.params.boardId);

      const board = await b.update(data);

      res.json({ board });
    } catch (error) {
      responseError(req, res, error);
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
