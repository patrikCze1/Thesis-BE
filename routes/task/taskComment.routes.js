const express = require("express");
const router = express.Router();
const {
  TaskComment,
  TaskCommentAttachment,
  User,
  Task,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator, notificationService } = require("../../service");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
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
const upload = multer({ storage: storage });

const ac = require("./../../security");
const { getIo } = require("../../service/io");
const { SOCKET_EMIT } = require("../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");
const io = getIo();

router.post(
  "/:taskId/comments",
  upload.array("files", 10),
  async (req, res) => {
    //authenticateToken
    const requiredAttr = ["text"];
    const body = { ...req.body };
    const result = validator.validateRequiredFields(requiredAttr, body);

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

      console.log(req.files);
      const data = {
        text: body.text,
        taskId: req.params.taskId,
        userId: user.id,
      };

      const newItem = await TaskComment.create(data);
      let attachemnts = [];

      if (req.files && req.files.length > 0) {
        await Promise.all(
          req.files.map(async (file) => {
            try {
              const attach = await TaskCommentAttachment.create({
                commentId: newItem.id,
                originalName: file.originalname,
                file: file.filename,
                path: file.path,
                size: file.size,
                type: file.mimetype,
              });
              attachemnts.push(attach);
            } catch (error) {
              console.log(error);
            }
          })
        );
      }

      newItem.setDataValue("commentAttachments", attachemnts);
      newItem.setDataValue("taskCommentUser", user);
      newItem.setDataValue("createdAt", new Date());

      const task = await Task.findByPk(req.params.taskId);
      const projectUsers = await findUsersByProject(task.projectId);
      for (const u of projectUsers) {
        io.to(u.id).emit(SOCKET_EMIT.TASK_COMMENT_NEW, {
          comment: newItem,
        });
      }

      res.json({ comment: newItem });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch("/:taskId/comments/:id", authenticateToken, async (req, res) => {
  try {
    let taskComment = await TaskComment.findByPk(req.params.id);
    const user = getUser(req, res);
    const permission =
      taskComment.userId == user.id
        ? ac.can(user.role).updateOwn("taskComment")
        : ac.can(user.role).updateAny("taskComment");
    if (!permission.granted) {
      res.status(403).json();
      return;
    }

    taskComment.text = req.body.text;
    await taskComment.save();

    res.json({ comment: taskComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:taskId/comments/:id", authenticateToken, async (req, res) => {
  //todo remove all task comment attach
  try {
    const comment = await TaskComment.findByPk(req.params.id);
    const user = getUser(req, res);
    const permission =
      comment.userId == user.id
        ? ac.can(user.role).deleteOwn("taskComment")
        : ac.can(user.role).deleteAny("taskComment");
    if (!permission.granted) {
      res.status(403).json();
      return;
    }

    const attachments = await TaskCommentAttachment.findAll({
      where: {
        commentId: req.params.id,
      },
    });
    const files = attachments.map(async (attachment) => {
      try {
        const attach = await TaskCommentAttachment.findByPk(attachment.id);
        const path = attach.path;
        await attach.destroy();
        return path;
      } catch (error) {
        console.log(error);
      }
    });

    const arr = await Promise.all(files);
    arr.forEach((file) => {
      fs.unlink(file, (error) => {
        if (error) console.log("File delete err ", error);
        else console.log("file deleted");
      });
    });
    await comment.destroy();

    res.json({ comment: comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete(
  "/:taskId/comment-attachments/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const attachment = await TaskCommentAttachment.findByPk(req.params.id);
      const comment = await TaskComment.findByPk(rattachment.commentId);
      const task = await Task.findByPk(req.params.taskId);
      const user = getUser(req, res);
      const permission =
        comment.userId == user.id
          ? ac.can(user.role).deleteOwn("taskComment")
          : ac.can(user.role).deleteAny("taskComment");
      if (!permission.granted && task.createdById != user.id) {
        res.status(403).json({});
        return;
      }
      fs.unlink(attachment.path, (error) => console.log(error));
      await attachment.destroy();

      res.json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
