const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const {
  getUser,
  authenticateToken,
  getCompanyKey,
} = require("../../auth/auth");
const { validator } = require("../../service");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `public/uploads/task-comment/${req.params.taskId}/`;

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
const upload = multer({ storage: storage });

const { getIo } = require("../../service/io");
const { SOCKET_EMIT, ROLE } = require("../../../enum/enum");
const { findUsersByProject } = require("../../repo/userRepo");
const { getFullName } = require("../../service/user.service");
const {
  sendEmailNotification,
  createTaskNotification,
} = require("../../service/notification/notification.service");
const { getFeUrl, responseError } = require("../../service/utils");
const { getDatabaseModels, getDatabaseConnection } = require("../../models");
const io = getIo();

router.post(
  "/:taskId/comments",
  [authenticateToken, upload.array("files", 10)],
  async (req, res) => {
    const mentionRegex = /\B@[a-z0-9_-]+/gi;
    const requiredAttr = ["text"];
    const body = { ...req.body };
    const result = validator.validateRequiredFields(requiredAttr, body);

    if (!result.valid || !(body.text.length > 0)) {
      res.status(400).send({
        message: "Tyto pole jsou povinná: " + result.requiredFields.join(", "),
      });
      return;
    }

    try {
      const ck = getCompanyKey(req);
      const db = getDatabaseModels(ck);
      const user = getUser(req, res);
      const data = {
        text: body.text,
        taskId: req.params.taskId,
        userId: user.id,
      };

      const newComment = await db.TaskComment.create(data);

      const mentionedUsers = data.text.match(mentionRegex);
      console.log("mentionedUsers", mentionedUsers);

      if (Array.isArray(mentionedUsers) && mentionedUsers.length > 0) {
        const task = await db.Task.findByPk(data.taskId);

        for (const mention of mentionedUsers) {
          const mentionUser = await db.User.findOne({
            where: { username: mention.substring(1) },
          });

          if (mentionUser) {
            if (mentionUser?.allowEmailNotification)
              sendEmailNotification(
                mentionUser.email,
                "Byl/a jste označen/a v komentáři",
                "src/email/task/",
                "comment_mention",
                {
                  commentText: data.text,
                  username: getFullName(user),
                  taskName: task.name,
                  taskLink: `${getFeUrl()}/projekty/${task.projectId}?ukol=${
                    task.id
                  }`,
                }
              );

            const newNotification = await createTaskNotification(
              task.id,
              `Uživatel ${getFullName(user)} Vás označil v komentáři v úkolu ${
                task.name
              }`,
              mentionUser.id,
              user.id
            );
            newNotification.setDataValue("creator", user);
            newNotification.setDataValue("createdAt", new Date());
            newNotification.setDataValue("TaskNotification", { task });

            io.to(mentionUser.id).emit(SOCKET_EMIT.NOTIFICATION_NEW, {
              notification: newNotification,
            });
          }
        }
      }

      console.log("req.files ", req.files);
      let attachemnts = [];

      if (req.files && req.files.length > 0) {
        await Promise.all(
          req.files.map(async (file) => {
            try {
              const attach = await db.TaskCommentAttachment.create({
                commentId: newComment.id,
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

      newComment.setDataValue("commentAttachments", attachemnts);
      newComment.setDataValue("taskCommentUser", user);
      newComment.setDataValue("createdAt", new Date());

      const task = await db.Task.findByPk(req.params.taskId);
      const conn = getDatabaseConnection(ck);
      const projectUsers = await findUsersByProject(conn, task.projectId);
      for (const u of projectUsers) {
        console.log("socket ", u.id);

        io.to(u.id).emit(SOCKET_EMIT.TASK_COMMENT_NEW, {
          comment: newComment,
        });
      }

      res.json({ comment: newComment });
    } catch (error) {
      responseError(req, res, error);
    }
  }
);

router.patch("/:taskId/comments/:id", authenticateToken, async (req, res) => {
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    let taskComment = await db.TaskComment.findByPk(req.params.id);
    const user = getUser(req, res);

    if (user.id !== taskComment.userId) {
      res.status(403).json({
        message: req.t("error.missingPermissionForAction"),
      });
      return;
    }

    taskComment.text = req.body.text;
    await taskComment.save();

    res.json({ comment: taskComment });
  } catch (error) {
    responseError(req, res, error);
  }
});

router.delete("/:taskId/comments/:id", authenticateToken, async (req, res) => {
  try {
    const ck = getCompanyKey(req);
    const db = getDatabaseModels(ck);
    const comment = await db.TaskComment.findByPk(req.params.id);
    const user = getUser(req, res);

    if (comment.userId !== user.id && !user.roles.includes(ROLE.ADMIN)) {
      res
        .status(403)
        .json({ message: req.t("error.missingPermissionForAction") });
      return;
    }

    const attachments = await db.TaskCommentAttachment.findAll({
      where: {
        commentId: req.params.id,
      },
    });
    const files = attachments.map(async (attachment) => {
      try {
        const attach = await db.TaskCommentAttachment.findByPk(attachment.id);
        const path = attach.path;
        await attach.destroy();
        return path;
      } catch (error) {
        console.log(error);
      }
    });

    const arr = await Promise.all(files);
    arr.forEach((file) => {
      fs.unlinkSync(file);
    });
    await comment.destroy();

    res.json({});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete(
  "/:taskId/comment-attachments/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const ck = getCompanyKey(req);
      const db = getDatabaseModels(ck);
      const attachment = await db.TaskCommentAttachment.findByPk(req.params.id);
      const comment = await db.TaskComment.findByPk(attachment.commentId);
      // const task = await Task.findByPk(req.params.taskId);
      const user = getUser(req, res);

      if (comment.userId !== user.id && !user.roles.includes(ROLE.ADMIN)) {
        res
          .status(403)
          .json({ message: req.t("error.missingPermissionForAction") });
        return;
      }
      fs.unlinkSync(attachment.path);
      await attachment.destroy();

      res.json();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
