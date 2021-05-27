const express = require("express");
const router = express.Router();
const { TimeTrack } = require("../../models/modelHelper");

router.get("/", async (req, res) => {
  try {
    const items = await TimeTrack.findAll();
    res.json(items);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const record = await TimeTrack.findByPk(req.params.id);
    res.json(record);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
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
    res.json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    let track = await TimeTrack.findByPk(req.params.id);
    
    track.name = req.body.name;
    track.beginAt = req.params.beginAt;
    track.endAt = req.params.endAt;
    track.taskId = req.params.taskId;
    await track.save();

    res.json(track);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removedRecord = await TimeTrack.remove({ id: req.params.id });
    res.json(removedRecord);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
