const express = require("express");
const router = express.Router();
const {
  TaskAttachment,
  TaskChangeLog,
  Task,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const crypto = require("crypto");
var path = require("path");
const multer = require("multer");
const fs = require("fs");
const { ROLE } = require("../../enum/enum");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `public/uploads/task/${req.params.taskId}/`;
    if (fs.existsSync(dir)) return cb(null, dir);
    else return fs.mkdir(dir, (error) => cb(error, dir));
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);

      cb(null, raw.toString("hex") + path.extname(file.originalname));
    });
  },
});
var upload = multer({ storage: storage });

router.post(
  "/:taskId/attachemts",
  [upload.array("files", 10), authenticateToken],
  async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.taskId);
      const user = getUser(req, res);

      if (
        !user.roles.includes(ROLE.ADMIN) &&
        !user.roles.includes(ROLE.MANAGEMENT) &&
        task.createdById !== user.id
      ) {
        res
          .status(403)
          .json({
            message: req.json({
              message: req.t("error.missingPermissionForAction"),
            }),
          });
        return;
      }

      let attachments = [];
      for (const file of req.files) {
        const attachment = await TaskAttachment.create({
          taskId: req.params.taskId,
          originalName: file.originalname,
          file: file.filename,
          path: file.path,
          size: file.size,
          type: file.mimetype,
          createdById: user.id,
        });
        attachments = [...attachments, attachment];

        await TaskChangeLog.create({
          taskId: req.params.taskId,
          userId: user.id,
          name: `Nahrání přílohy: ${file.originalname}`,
        });
      }

      res.json({ message: "Přílohy nahrány", attachments });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      if (
        !user.roles.includes(ROLE.ADMIN) &&
        !user.roles.includes(ROLE.MANAGEMENT) &&
        task.createdById !== user.id
      ) {
        res
          .status(403)
          .json({
            message: req.json({
              message: req.t("error.missingPermissionForAction"),
            }),
          });
        return;
      }

      const attachment = await TaskAttachment.findByPk(req.params.id);
      fs.unlinkSync(attachment.path);
      const origName = attachment.originalName;
      await attachment.destroy();

      await TaskChangeLog.create({
        taskId: req.params.taskId,
        userId: user.id,
        name: `Smazání přílohy: ${origName}`,
      });
      res.json({});
    } catch (error) {
      res.status(500).json({});
    }
  }
);

module.exports = router;
