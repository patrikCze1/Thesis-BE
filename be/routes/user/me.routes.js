const express = require("express");
const router = express.Router();
const { User, Group } = require("../../models/modelHelper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const { authenticateToken, getUser } = require("../../auth/auth");
const { sendMail } = require("../../email/config");

/**
 * List of users groups
 */
router.get("/groups", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const groups = await Group.findAll({
      where: {
        "$groupUser.id$": user.id,
      },
      include: [
        {
          model: User,
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
  try {
    const me = getUser(req, res);
    let user = await User.findByPk(me.id);

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

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
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
  try {
    const me = getUser(req, res);
    const user = await User.findByPk(me.id);

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

router.post("/forgotten-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error(req.t("error.validation.emailDoesntExist"));
    else {
      const token = jwt.sign({ email }, process.env.PASSWORD_SECRET, {
        expiresIn: parseInt(process.env.PASSWORD_SECRET_EXPIRATION),
      });

      user.passwordResetHash = token;
      await user.save();

      try {
        await sendMail(
          user.email,
          req.t("message.forgottenPassword"),
          "email/user/",
          "reset_password",
          { link: `${process.env.FE_URI}/obnovit-heslo/?token=${token}` }
        );
      } catch (error) {
        throw new Error(error.message);
      }

      res.json({
        message: req.t("message.forgottenPassword"),
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const { email } = jwt.verify(token, process.env.PASSWORD_SECRET);
    if (!email) throw new Error(req.t("error.validation.invalidLink"));

    const user = await User.findOne({
      where: { email, passwordResetHash: token },
    });

    if (!user) throw new Error(req.t("error.validation.invalidLink"));
    else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const data = {
        password: hashedPassword,
        passwordResetHash: null,
      };
      await user.update(data);

      res.json({
        message: req.t("message.passwordChanged"),
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
