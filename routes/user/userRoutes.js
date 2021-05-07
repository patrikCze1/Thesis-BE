const express = require("express");
const router = express.Router();
const { User, TimeTrack } = require("../../models/modelHelper");
const userRepo = require("../../repo/userRepo.js");

const { authenticateToken, decodeToken } = require("../../auth/auth");

router.get("/", userRepo.findAll);

router.get("/private", authenticateToken, async (req, res) => {
  const token = req.header("auth-token");
  const id = decodeToken(token);
  res.send(id);
});

router.get("/:userId/tracks", async (req, res) => {
  try {
    const items = await TimeTrack.findAll({
      where: {
        UserId: req.params.userId,
      },
    });
    res.json(items);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removedUser = await User.remove({ id: req.params.id });
    res.json(removedUser);
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
