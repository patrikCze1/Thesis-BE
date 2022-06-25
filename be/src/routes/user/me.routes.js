const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  getUser,
  getCompanyKey,
} = require("../../auth/auth");
const { getDatabaseModels } = require("../../models");
const { createHashedPassword } = require("../../service/user.service");

/**
 * List of users groups
 */
router.get("/groups", authenticateToken, async (req, res) => {
  const user = getUser(req, res);
  const ck = getCompanyKey(req);

  try {
    const db = getDatabaseModels(ck);
    const groups = await db.Group.findAll({
      where: {
        "$groupUser.id$": user.id,
      },
      include: [
        {
          model: db.User,
          as: "groupUser",
          attributes: [],
        },
      ],
    });
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/change-password", authenticateToken, async (req, res) => {
  const ck = getCompanyKey(req);
  try {
    const db = getDatabaseModels(ck);
    const me = getUser(req, res);
    let user = await db.User.findByPk(me.id);

    const { password, passwordAgain } = req.body;

    if (!password || !passwordAgain) {
      res.status(400).send({
        success: false,
        message: req.t("error.validation.emptyPassword"),
      });
      return;
    } else if (password !== passwordAgain) {
      res.status(400).send({
        success: false,
        message: req.t("error.validation.passwordDontMatch"),
      });
      return;
    }

    const hashedPassword = await createHashedPassword(req.body.password);
    const data = {
      password: hashedPassword,
    };
    await user.update(data);

    res.json({ success: true });
  } catch (e) {
    if (e.errors && e.errors.length > 0) {
      res.status(500).json({ message: e.errors[0].message });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
});

router.patch("/update", authenticateToken, async (req, res) => {
  const ck = getCompanyKey(req);

  try {
    const db = getDatabaseModels(ck);
    const me = getUser(req, res);
    const user = await db.User.findByPk(me.id);

    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });
    console.log("user", user);
    await user.save();

    return res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/csrf", authenticateToken, async (req, res) => {
  try {
    res.cookie("XSRF-TOKEN", req.csrfToken()).json({ message: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
