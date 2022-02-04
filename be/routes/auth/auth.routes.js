const express = require("express");
const router = express.Router();
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
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        return res
          .cookie("Auth-Token", token, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          })
          .cookie("Refresh-Token", refreshToken, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          })
          .send({
            token,
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
