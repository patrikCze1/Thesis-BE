const express = require("express");
const router = express.Router();
const db = require("../../models");
const userRepo = require("../../repo/userRepo.js");
const User = db.User;
const {
  authenticateToken,
  decodeToken,
} = require("../../auth/auth");

router.get("/", userRepo.findAll);

router.get("/private", authenticateToken, async (req, res) => {
  const token = req.header("auth-token");
  const id = decodeToken(token);
  res.send(id);
});

module.exports = router;
