const express = require("express");
const router = express.Router();
const {
  TaskComment,
  TaskCommentAttachment,
  User,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator, notificationService } = require("../../service");
const crypto = require("crypto");
var path = require("path");
const multer = require("multer");
const fs = require("fs");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `public/uploads/task-comment/${req.params.taskId}/`;
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

router.post(
  "/:taskId/comments",
  upload.array("attachments", 10),
  async (req, res) => {
    //authenticateToken
    const requiredAttr = ["text"];
    console.log(req);
    const result = validator.validateRequiredFields(requiredAttr, req.body);
    if (!result.valid) {
      res.status(400).send({
        message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
      });
      return;
    }

    try {
      // send notification, pokud byl nekdo oznacen
      // todo pokud jsem nevypl odesilani
      const user = getUser(req, res);
      // notificationService.createTaskNotification(
      //   req.params.id,
      //   req.body.text,
      //   tagedUserId
      //   user.id
      // );

      const data = {
        text: req.body.text,
        taskId: req.params.taskId,
        userId: user.id,
      };

      const newItem = await TaskComment.create(data);

      if (req.files && req.files.length > 0) {
        req.files.forEach(async (file) => {
          await TaskCommentAttachment.create({
            commentId: newItem.id,
            originalName: file.originalname,
            file: file.filename,
            path: file.path,
            size: file.size,
            type: file.mimetype,
          });
        });
      }

      res.send(newItem);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.patch("/:taskId/comments/:id", authenticateToken, async (req, res) => {
  try {
    let taskComment = await TaskComment.findByPk(req.params.id);
    const user = getUser(req, res);

    if (taskComment.userId !== user.id) {
      // || admin...
      res
        .status(403)
        .json({ message: "Pro tuto akci nemáte dostatečná práva." });
      return;
    }

    taskComment.text = req.body.text;
    await taskComment.save();

    res.json(taskComment);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:taskId/comments/:id", authenticateToken, async (req, res) => {
  //todo remove all task comment attach
  try {
    const comment = await TaskComment.findByPk(req.params.id);
    const user = getUser(req, res);

    if (comment.userId !== user.id) {
      // || admin...
      res
        .status(403)
        .json({ message: "Pro tuto akci nemáte dostatečná práva." });
      return;
    }

    const attachments = await TaskCommentAttachment.findAll({
      where: {
        TaskCommentId: req.params.id,
      },
    });
    attachments.forEach(async (attachment) => {
      const attach = TaskCommentAttachment.findByPk(attachment.id);
      await attach.destroy();
      //todo remove files
    });

    await comment.destroy();

    res.json({ success: true, message: "Success" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete(
  "/comment-attachments/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const attachment = await TaskCommentAttachment.findByPk(req.params.id);
      fs.unlink(attachment.path, (error) => console.log(error));
      await attachment.destroy();

      res.json({ success: true, message: "Success" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
