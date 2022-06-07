const express = require("express");
const { SOCKET_EMIT } = require("../../../enum/enum");
const { dbService } = require("../../service");
const router = express.Router();

const { responseError } = require("../../service/utils");

router.get("/", async (req, res) => {
  try {
    //todo create company in db

    await dbService.createDB("jago1");

    res.json({ success: true });
  } catch (error) {
    console.error("error", error);
    responseError(req, res, error);
  }
});

module.exports = router;
