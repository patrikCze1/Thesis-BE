const express = require("express");
const router = express.Router();
const { TimeTrack } = require("../../models/modelHelper");
const { authenticateToken } = require("../../auth/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const items = await TimeTrack.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const record = await TimeTrack.findByPk(req.params.id);
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  //todo validate

  const data = {
    name: req.body.name,
    beginAt: req.params.beginAt,
    endAt: req.params.endAt,
    userId: req.params.userId,
    taskId: req.params.taskId,
  };

  try {
    const newItem = await TimeTrack.create(data);
    res.send(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    let track = await TimeTrack.findByPk(req.params.id);
    
    track.name = req.body.name;
    track.beginAt = req.params.beginAt;
    track.endAt = req.params.endAt;
    track.taskId = req.params.taskId;
    await track.save();

    res.json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const removedRecord = await TimeTrack.remove({ id: req.params.id });
    res.json(removedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
