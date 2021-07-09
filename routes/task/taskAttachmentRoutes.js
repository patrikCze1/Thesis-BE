const express = require("express");
const router = express.Router();
const {
  TaskAttachment,
  TaskChangeLog,
} = require("../../models/modelHelper");
const { getUser, authenticateToken } = require("../../auth/auth");
const { validator, notificationService } = require("../../service");
const crypto = require("crypto");
var path = require('path');
const multer  = require('multer');
const fs = require('fs');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `public/uploads/task/${req.params.taskId}/`;
    fs.exists(dir, exist => {
      if (!exist) {
        return fs.mkdir(dir, error => cb(error, dir))
      }
      return cb(null, dir)
    });
  },
  filename: function(req, file, cb) {
    // cb(null, file.originalname);
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err);

      cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
});
var upload = multer({ storage: storage });

router.get("/:taskId/attachemts", authenticateToken, async (req, res) => {

});

router.post("/:taskId/attachemts", upload.array('attachments', 10), async (req, res, next) => {//authenticateToken
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
  const user = getUser(req, res);

  try {

    req.files.forEach(async file => {
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
        name: `Nahrání přílohy: ${file.originalName}`,
      });
    });

    res.json({ success: true, message: 'Přílohy nahrány' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:taskId/attachemts/:id", authenticateToken, async (req, res) => {
  try {
    const attachment = await TaskAttachment.findByPk(req.params.id);
    fs.unlink(attachment.path, error => console.log(error));
    const origName = attachment.originalName;
    await attachment.destroy();

    const user = getUser(req, res);
    await TaskChangeLog.create({
      taskId: req.params.taskId,
      userId: user.id,
      name: `Smazání přílohy: ${origName}`,
    });
    res.json({ success: true, message: "Success" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
