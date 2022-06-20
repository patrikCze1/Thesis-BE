const express = require("express");
const { createSequelizeConnection } = require("../../../config/config");

const { ROLE } = require("../../../enum/enum");
const { sequelizeAdmin } = require("../../models");
const { dbService } = require("../../service");
const { createHashedPassword } = require("../../service/user.service");
const router = express.Router();

const { responseError } = require("../../service/utils");

router.get("/", async (req, res) => {
  try {
    const KEY = "KEY";
    // todo validate key...

    // todo check if key already exists in db + admin
    const existingCompany = await sequelizeAdmin.models.Company.findOne({
      where: { key: KEY },
    });
    console.log("existingCompany", existingCompany);
    if (existingCompany) {
      return res
        .status(400)
        .json({ message: req.t("auth.error.companyAlreadyExists") });
    }
    const user = {
      email: "a@a.com",
      phone: "123123123",
      username: "a@a.com",
      password: await createHashedPassword("1234"),
      roles: [ROLE.ADMIN],
      firstName: "Test",
      lastName: "Test",
    };
    //todo send verification email
    const { connString } = await dbService.createDB(KEY, user);
    createSequelizeConnection(KEY, connString);

    const company = await sequelizeAdmin.models.Company.create({
      ...req.body,
      connectionString: connString,
      key: KEY,
    });

    console.log("company", company);

    res.json({ success: true, company });
  } catch (error) {
    console.error("error", error);
    responseError(req, res, error);
  }
});

module.exports = router;
