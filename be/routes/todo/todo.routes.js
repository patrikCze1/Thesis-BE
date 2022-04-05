const express = require("express");
const router = express.Router();

const { Todo } = require("../../models/modelHelper");
const { getUser } = require("../../auth/auth");
const { authenticateToken } = require("../../auth/auth");
const { responseError } = require("../../service/utils");
const { validator } = require("../../service");

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  try {
    const todos = await Todo.findAll({
      where: {
        UserId: user.id,
      },
    });
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
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
    name: req.body.name,
    userId: user.id,
  };

  try {
    const todo = await Todo.create(data);
    res.json({ todo });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    let todo = await Todo.findByPk(req.params.id);
    console.log(req.body);
    // todo.name = req.body.name;
    todo.completed = req.body.completed;
    await todo.save();

    res.json({ todo });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Todo.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
