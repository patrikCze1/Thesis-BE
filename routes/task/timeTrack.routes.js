const express = require("express");
const router = express.Router();
const { TimeTrack, User } = require("../../models/modelHelper");
const { authenticateToken, getUser } = require("../../auth/auth");
const ac = require("./../../security");
const { Op } = require("sequelize");

router.get("/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  const permission = ac.can(user.role).readAny("timeTrack");
  if (!permission.granted) {
    res.status(403).json({ success: false });
    return;
  }

  try {
    const tracks = await TimeTrack.findAll({
      where: {
        createdAt: {
          [Op.between]: [req.query.from, req.query.to],
        },
      },
      include: [{ model: User, as: "user" }],
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "beginAt",
          req.query.sort ? req.query.sort : "DESC",
        ],
      ],
    });
    res.json({ success: true, tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get all user tracks
 */
router.get("/me/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const tracks = await TimeTrack.findAll({
      where: {
        userId: user.id,
        // createdAt: {
        //   [Op.between]: [req.query.from, req.query.to],
        // },
      },
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "beginAt",
          req.query.sort ? req.query.sort : "DESC",
        ],
      ],
    });
    const activeTrack = await TimeTrack.findOne({
      where: { userId: user.id, endAt: null },
    });
    res.json({ success: true, tracks, activeTrack });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// maybe findActive???

router.post("/", authenticateToken, async (req, res) => {
  // create track
  const requiredAttr = ["beginAt", "endAt"];
  const result = validator.validateRequiredFields(requiredAttr, req.body);
  if (!result.valid) {
    res.status(400).send({
      message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    });
    return;
  }

  const user = getUser(req, res);
  const { name, beginAt, endAt, projectId } = req.body;

  const data = {
    name: name,
    beginAt: beginAt,
    endAt: endAt,
    userId: user.id,
    projectId: projectId,
    // taskId: taskId,
  };

  try {
    const track = await TimeTrack.create(data);
    res.send({ success: true, track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/start/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const activeTracks = await TimeTrack.findAll({
      where: {
        endAt: {
          [Op.is]: null,
        },
        userId: user.id,
      },
    });

    for (let i = 0; i < activeTracks.length; i++) {
      activeTracks[i].endAt = new Date();
      await activeTracks.save();
    }

    const { name, projectId } = req.body;

    const data = {
      name: name,
      beginAt: new Date(),
      userId: user.id,
      projectId: projectId,
      // taskId: taskId,
    };

    const track = await TimeTrack.create(data);
    res.send({ success: true, track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/stop/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    let track = await TimeTrack.findByPk(req.params.id);
    console.log(track);
    if (track.userId != user.id) {
      res.status(403).json({
        success: false,
      });
      return;
    }

    const { name, projectId } = req.body;

    track.endAt = new Date();
    (track.projectId = projectId), (track.name = name), await track.save();

    res.send({ success: true, track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  // update trakc
  const user = getUser(req, res);

  try {
    let track = await TimeTrack.findByPk(req.params.id);

    if (track.userId != user.id) {
      res.status(403).json({
        success: false,
      });
      return;
    }

    track.name = req.body.name;
    track.beginAt = req.body.beginAt;
    track.endAt = req.body.endAt;
    track.taskId = req.body.taskId;
    track.projectId = req.body.projectId;

    await track.save();

    res.json({ success: true, track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const track = await TimeTrack.findByPk(req.params.id);

    if (track.userId != user.id) {
      res.status(403).json({
        success: false,
      });
      return;
    }

    await track.destroy();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
