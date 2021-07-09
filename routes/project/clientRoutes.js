const express = require("express");
const router = express.Router();
const { Client, Project } = require("../../models/modelHelper");
const { Op } = require("sequelize");
const { authenticateToken } = require("../../auth/auth");
const { validator } = require('../../service');

// jen pro adminy

router.get("/", authenticateToken, async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: {
        name: {
            [Op.like]: req.query.name ? `%${req.query.name}%` : '%',
        }
      },
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "name",
          req.query.sort ? req.query.sort : "ASC",
        ],
      ],
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'projects' },
      ],
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const requiredAttr = ['name'];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(', '),
    });
    return;
  }

  const data = req.body;

  try {
    const newRecord = await Client.create(data);
    res.send(newRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    const updated = await client.update(req.body);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    client.destroy();

    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
