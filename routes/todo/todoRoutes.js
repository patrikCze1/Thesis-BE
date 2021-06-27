const express = require("express");
const router = express.Router();
const { Todo } = require("../../models/modelHelper");
const { getUser } = require("../../auth/auth");
const { authenticateToken } = require("../../auth/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: {
        UserId: getUser().id,
      },
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({
      name: "name is required",
    });
    return;
  }

  const data = {
    name: req.body.title,
    UserId: getUser().id,
  };

  try {
    const newItem = await Todo.create(data);
    res.send(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    let todo = await Todo.findByPk(req.params.id);

    todo.name = req.body.name;
    todo.completed = req.body.completed;
    await todo.save();

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const removedRow = await Todo.remove({ id: req.params.id });
    res.json(removedRow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
