const express = require("express");
const router = express.Router();
const { User } = require("../../models/modelHelper");
const {
  generateToken,
  generateRefreshToken,
  isRefreshTokenValid,
  decodeToken,
} = require("../../auth/auth");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({
      message: "Content can not be empty!",
    });
    return;
  }

  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    const match = await bcrypt.compare(req.body.password, user.password);

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
          user,
        });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid Credentials", success: false });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message, success: false });
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.header("refresh-token");

  if (token == null) return res.sendStatus(401);

  const data = decodeToken(token);
  if (!data.user || !isRefreshTokenValid(data.user.id, token))
    return res.sendStatus(400); // todo store in db

  try {
    // jwt.verify(token, process.env.REFRESH_TOKEN); //todo

    const newToken = generateToken(data.user);

    res.send({
      token: newToken,
    });
  } catch (error) {
    res.status(400).send({ error: error.message, success: false });
  }
});

module.exports = router;
