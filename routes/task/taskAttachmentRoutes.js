const express = require("express");
const router = express.Router();
const {
  TaskAttachment,
  TaskChangeLog,
  TaskCommentAttachment,
  TaskComment,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const crypto = require("crypto");
var path = require("path");
const multer = require("multer");
const fs = require("fs");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `public/uploads/task/${req.params.taskId}/`;
    fs.exists(dir, (exist) => {
      if (!exist) {
        return fs.mkdir(dir, (error) => cb(error, dir));
      }
      return cb(null, dir);
    });
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);

      cb(null, raw.toString("hex") + path.extname(file.originalname));
    });
  },
});
var upload = multer({ storage: storage });

router.get("/:taskId/attachemts", authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const attachments = await TaskAttachment.findAll({
      where: {
        taskId: taskId,
      },
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
    });

    const commentAttachments = await TaskCommentAttachment.findAll({
      where: {
        "$comment.taskId$": taskId,
      },
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
      include: [
        {
          model: TaskComment,
          attributes: [],
          as: "comment",
        },
      ],
    });
    res.json({ success: true, attachments, commentAttachments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  "/:taskId/attachemts",
  upload.array("attachments", 10),
  async (req, res, next) => {
    //authenticateToken
    //   const requiredAttr = ["title", "description"];
    //   const result = validator.validateRequiredFields(requiredAttr, req.body);
    //   if (!result.valid) {
    //     res.status(400).send({
    //       message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
    //     });
    //     return;
    //   }
    console.log(req.files, req.body);
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any

    try {
      const task = await Task.findByPk(req.params.taskId);
      const user = getUser(req, res);
      const permission = task.createdById == user.id ? ac.can(user.role).updateOwn("task") : ac.can(user.role).updateAny("task");
      if (!permission.granted) {
        res.status(403).json({ success: false });
        return;
      }

      req.files.forEach(async (file) => {
        await TaskAttachment.create({
          taskId: req.params.taskId,
          originalName: file.originalname,
          file: file.filename,
          path: file.path,
          size: file.size,
          type: file.mimetype,
          createdById: user.id,
        });

        await TaskChangeLog.create({
          taskId: req.params.taskId,
          userId: user.id,
          name: `Nahrání přílohy: ${file.originalname}`,
        });
      });

      res.json({ success: true, message: "Přílohy nahrány" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.delete(
  "/:taskId/attachemts/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.taskId);
      const user = getUser(req, res);
      const permission = task.createdById == user.id ? ac.can(user.role).updateOwn("task") : ac.can(user.role).updateAny("task");
      if (!permission.granted) {
        res.status(403).json({ success: false });
        return;
      }

      const attachment = await TaskAttachment.findByPk(req.params.id);
      fs.unlink(attachment.path, (error) => console.log(error));
      const origName = attachment.originalName;
      await attachment.destroy();

      await TaskChangeLog.create({
        taskId: req.params.taskId,
        userId: user.id,
        name: `Smazání přílohy: ${origName}`,
      });
      res.json({ success: true, message: "Success" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
