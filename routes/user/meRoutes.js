const express = require("express");
const router = express.Router();
const { User, Group } = require("../../models/modelHelper");
const { Op } = require("sequelize");
const { authenticateToken, getUser } = require("../../auth/auth");

router.get("/groups", authenticateToken, async (req, res) => {
    const user = getUser(req, res);
    
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
