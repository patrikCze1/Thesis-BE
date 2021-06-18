const express = require("express");
const router = express.Router();
const { User, TimeTrack } = require("../../models/modelHelper");
const bcrypt = require("bcrypt");
const { authenticateToken, decodeToken } = require("../../auth/auth");

router.get("/", async (req, res) => {
  try {
    const items = await User.findAll({
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.page ? parseInt(req.query.page) : 0,
      order: [
        [
          req.query.orderBy ? req.query.orderBy : 'lastName', 
          req.query.sort ? req.query.sort : 'ASC',
        ]
      ]
    });
    res.json(items);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/private", authenticateToken, async (req, res) => {
  const token = req.header("auth-token");
  const id = decodeToken(token);
  console.log('inside private');
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
    res.json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  if (!req.body.username || !req.body.email || !req.body.password) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const data = req.body;
    data.password = hashedPassword;
    console.log(data);
    const savedUser = await User.create(data);
    console.log(savedUser.toJSON());
    res.json(savedUser);
  } catch (e) {
    res.json({ message: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    let user = await User.findByPk(req.params.id);

    user.username = req.body.username;
    await user.save();

    res.json(user);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  //nemazat jen deaktivovat
  try {
    let removedUser = await User.findByPk(req.params.id);

    removedUser.active = false;
    await removedUser.save();

    res.json(removedUser);

    // const removedUser = await User.remove({ id: req.params.id });
    // res.json(removedUser);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
