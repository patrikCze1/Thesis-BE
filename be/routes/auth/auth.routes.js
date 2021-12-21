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
      message: req.t("error.bad_credentials"),
    });
    return;
  }

  try {
    const user = await User.findOne({
      where: { [Op.or]: [{ email: email }, { username: email }] },
    });

    const match = await bcrypt.compare(password, user.password);

    if (user && match) {
      // if ok return auth token
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
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies["Refresh-Token"];
  console.log("refresh req", token);
  if (token == null) return res.sendStatus(401);

  const data = decodeToken(token);
  // if (!data.user || !isRefreshTokenValid(data.user.id, token))
  //   return res.sendStatus(400); // todo store in db

  try {
    jwt.verify(token, process.env.REFRESH_TOKEN); //todo

    const newToken = generateToken(data.user);

    res.send({
      token: newToken,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
