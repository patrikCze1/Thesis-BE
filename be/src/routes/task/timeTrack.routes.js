const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const {
  authenticateToken,
  getUser,
  getCompanyKey,
} = require("../../auth/auth");

const { validator } = require("../../service");
const { SOCKET_EMIT } = require("../../../enum/enum");
const { getIo } = require("../../service/io");
const { responseError } = require("../../service/utils");
const { getDatabaseModels } = require("../../models");

router.get("/", authenticateToken, async (req, res) => {
  // const user = getUser(req, res);
  // const permission = ac.can(user.role).readAny("timeTrack");
  // if (!permission.granted) {
  //   res.status(403).json({ success: false });
  //   return;
  // }

  const { from, to, userId, projectId } = req.query;
  const where = { endAt: { [Op.not]: null } };
  if (from && to) {
    const to = new Date(req.query.to);
    to.setHours(23, 59, 59);
    where.beginAt = {
      [Op.between]: [new Date(req.query.from), to],
    };
  }
  console.log("where", where);
  if (userId) where.userId = parseInt(userId);
  if (projectId) where.projectId = parseInt(projectId);

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const tracks = await db.TimeTrack.findAll({
      where: where,
      include: [
        { model: db.User, as: "user" },
        {
          model: db.Project,
          as: "project",
          attributes: ["name", "id"],
        },
      ],
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : "beginAt",
          req.query.sort ? req.query.sort : "DESC",
        ],
      ],
    });
    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get all user tracks
 */
router.get("/me/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  const where = {
    userId: user.id,
    endAt: {
      [Op.not]: null,
    },
  };

  if (req.query.from != "null" && req.query.to != "null") {
    const to = new Date(req.query.to);
    to.setHours(23, 59, 59);
    where.beginAt = {
      [Op.between]: [new Date(req.query.from), to],
    };
  }

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    let tracks, activeTrack;
    if (Boolean(req.query.returnTracks) === true) {
      tracks = await db.TimeTrack.findAndCountAll({
        where,
        include: [
          {
            model: db.User,
            as: "user",
          },
          {
            model: db.Project,
            as: "project",
            attributes: ["name", "id"],
          },
        ],
        limit: req.query.limit ? parseInt(req.query.limit) : null,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
        order: [
          [
            req.query.orderBy ? req.query.orderBy : "beginAt",
            req.query.sort ? req.query.sort : "DESC",
          ],
        ],
      });
    }

    if (Boolean(req.query.returnActive) === true) {
      activeTrack = await db.TimeTrack.findOne({
        where: { userId: user.id, endAt: null },
      });
    }
    res.json({ tracks, activeTrack });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
    beginAt: new Date(beginAt),
    endAt: new Date(endAt),
    userId: user.id,
    projectId: projectId,
    // taskId: taskId,
  };

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const track = await db.TimeTrack.create(data);
    res.json({ track });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.post("/start/", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const activeTracks = await db.TimeTrack.findAll({
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

    const track = await db.TimeTrack.create(data);
    res.json({ track });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.post("/stop/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const io = getIo();
    let track = await db.TimeTrack.findByPk(req.params.id);
    console.log(track);
    if (track.userId != user.id) {
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }

    const { name, projectId } = req.body;

    track.endAt = new Date();
    (track.projectId = projectId), (track.name = name), await track.save();

    if (projectId) {
      track.setDataValue(
        "project",
        await db.Project.findByPk(projectId, { attributes: ["id", "name"] })
      );
    }

    io.to(`${ck}_${user.id}`).emit(SOCKET_EMIT.TIME_TRACK_STOP, {
      id: req.params.id,
    });

    res.json({ track });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    let track = await db.TimeTrack.findByPk(req.params.id);

    if (track.userId != user.id) {
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }

    track.name = req.body.name;
    track.beginAt = req.body.beginAt;
    track.endAt = req.body.endAt;
    track.taskId = req.body.taskId;
    if (req.body.projectId === "" || req.body.projectId === "null")
      track.projectId = null;
    else track.projectId = req.body.projectId;

    await track.save();

    res.json({ track });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const track = await db.TimeTrack.findByPk(req.params.id);

    if (track.userId != user.id) {
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }

    await track.destroy();

    res.json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;