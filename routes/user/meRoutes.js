const express = require("express");
const router = express.Router();
const { User, Group } = require("../../models/modelHelper");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { authenticateToken, getUser } = require("../../auth/auth");

/**
 * List of users groups
 */
router.get("/groups", authenticateToken, async (req, res) => {
    const user = getUser(req, res);
    
  try {
    const groups = await Group.findAll({
      where: {
        '$groupUser.id$': user.id,
      },
      include: [
        {
          model: User,
          as: 'groupUser',
          attributes: [],
        }
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
        message: "Heslo nemůže být prázné",
      });
      return;
    } else if (password !== passwordAgain) {
      res.status(400).send({
        success: false,
        message: "Hesla se neshodují",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const data = {
      password: hashedPassword,
    }
    await user.update(data);

    res.send({ success: true });
  } catch (e) {
    if (e.errors && e.errors.length > 0) {
      res.status(500).json({ message: e.errors[0].message });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
});

module.exports = router;
