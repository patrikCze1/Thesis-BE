const express = require("express");
const router = express.Router();
const Todo = require("../../models/modelHelper");
const { getUser } = require("../../auth/auth");

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: {
        UserId: getUser().id,
      },
    });
    res.json(todos);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    res.json(todo);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
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
    res.json({ message: error });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    let todo = await Todo.findByPk(req.params.id);

    todo.name = req.body.name;
    todo.completed = req.body.completed;
    await todo.save();

    res.json(todo);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removedRow = await Todo.remove({ id: req.params.id });
    res.json(removedRow);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
