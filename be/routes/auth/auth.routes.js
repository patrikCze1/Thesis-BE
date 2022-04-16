const express = require("express");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

const { User } = require("../../models/modelHelper");
const {
  generateToken,
  generateRefreshToken,
  isRefreshTokenValid,
  decodeToken,
} = require("../../auth/auth");
const { sendMail } = require("../../email/config");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: req.t("error.badCredentials"),
    });
    return;
  }

  try {
    const user = await User.findOne({
      where: { [Op.or]: [{ email }, { username: email }] },
    });

    if (user) {
      if (user.deactivated) throw new Error(req.t("error.accountDeactivated"));
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        const userJSON = user.toJSON();
        console.log("typeof", userJSON);

        if (typeof userJSON.roles === "string")
          userJSON.roles = JSON.parse(userJSON.roles);
        const userRoles =
          userJSON.roles?.map((role) => role.replace(/\\/g, "")) || []; //JSON.parse(user.roles.replace(/\\/g, ""));

        return res
          .cookie("Auth-Token", token, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          })
          .cookie("Refresh-Token", refreshToken, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          })
          .json({
            user: {
              ...userJSON,
              roles: JSON.stringify(userRoles),
            },
          });
      } else {
        return res.status(400).json({ message: req.t("error.badCredentials") });
      }
    } else
      return res
        .status(400)
        .json({ message: req.t("auth.error.userDontExist") });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

router.post("/refresh", async (req, res) => {
  const token = req.cookies["Refresh-Token"];

  if (token == null) return res.sendStatus(403);

  try {
    jwt.verify(token, process.env.REFRESH_TOKEN);

    const data = decodeToken(token);
    const newToken = generateToken(data.user);

    res
      .cookie("Auth-Token", newToken, {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      })
      .send({
        token: newToken,
      });
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res.status(400).json({ message: req.t("auth.error.jwtExpired") });
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
