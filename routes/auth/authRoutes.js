const express = require("express");
const router = express.Router();
const db = require("../../models");
const userRepo = require("../../repo/userRepo.js");
const User = db.User;
const { generateToken, generateRefreshToken, isRefreshTokenValid, decodeToken } = require("../../auth/auth");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  if (!req.body.username || !req.body.email || !req.body.password) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
    };

    const savedUser = await User.create(user);
    res.json(savedUser);
  } catch (e) {
    res.json({ message: "Error: " + e });
  }
});

router.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      
      res
        // .cookie("auth-token", token, { secure: true, httpOnly: true })
        // .cookie("refresh-token", refreshToken, { secure: true, httpOnly: true })
        .send({
          token,
          refreshToken,
          tokenExpire: parseInt(process.env.TOKEN_SECRET_EXPIRATION),
        });
    } else {
      res.send({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.send(error);
  }
});

router.post("/refresh", async (req, res) => {
  //https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
  const token = req.header("refresh-token");

  if (token == null) return res.sendStatus(401);

  const user = decodeToken(token);
  if (!isRefreshTokenValid(user.userId, token)) return res.sendStatus(401);

  try {
    // jwt.verify(token, process.env.REFRESH_TOKEN); //todo
    
    const newToken = generateToken(user.userId);

    res.send({
      token: newToken,
      tokenExpire: parseInt(process.env.TOKEN_SECRET_EXPIRATION),
    });
  } catch (error) {
    res.status(400).send("Invalid token");
  }
});

module.exports = router;
