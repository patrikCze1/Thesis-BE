const express = require("express");
const router = express.Router();
const { Client } = require("../../models/modelHelper");
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
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
    res.json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    res.json(client);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  if (!req.body.name) {
    res.status(400).send({
      message: "name is required",
    });
    return;
  }

  const data = {
    name: req.body.name,
  };

  const newRecord = await Client.create(data);
  res.send(newRecord);
});

router.patch("/:id", async (req, res) => {
  try {
    let client = await Client.findByPk(req.params.id);

    client.name = req.body.name;
    await client.save();

    res.json(client);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removedClient = await Client.remove({ id: req.params.id });
    res.json(removedClient);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
