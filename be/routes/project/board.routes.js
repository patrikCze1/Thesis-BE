const express = require("express");
const router = express.Router();
const { Board } = require("../../models/modelHelper");
const {
  getUser,
  authenticateToken,
  managementAccessOnly,
} = require("../../auth/auth");
const { validator } = require("../../service");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT, ROLE } = require("../../enum/enum");

router.post(
  "/:projectId/boards",
  [authenticateToken, managementAccessOnly],
  async (req, res) => {
    const currentUser = getUser(req, res);

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
      projectId: req.params.projectId,
    };

    try {
      const board = await Board.create(data);

      res.json({ board });
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
    const user = getUser(req, res);

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
      res.json({ message: req.t("board.message.boardDeleted") });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
