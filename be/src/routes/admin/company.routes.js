const express = require("express");
const slugify = require("slugify");
const { Op } = require("sequelize");
const { createSequelizeConnection } = require("../../../config/config");

const { ROLE } = require("../../../enum/enum");
const { sequelizeAdmin } = require("../../models");
const { dbService } = require("../../service");
const { createHashedPassword } = require("../../service/user.service");
const { validator } = require("../../service");
const router = express.Router();

const { responseError } = require("../../service/utils");
const { sendMail } = require("../../email/config");

router.get("/:id", async (req, res) => {
  try {
    const company = await sequelizeAdmin.models.Company.findOne({
      where: { verificationCode: req.params.id },
    });

    if (company) {
      company.emailVerifiedAt = new Date();
      company.verificationCode = null;
      await company.save();

      res.setHeader("Content-Type", "text/html");
      res.send(`
  <h1>Účet úspěšně ověřen</h1>
  `);
    } else {
      res.setHeader("Content-Type", "text/html");
      res.send(`
  <h1>Účet se nepodařilo ověřit</h1>
  `);
    }
  } catch (error) {
    responseError(req, res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const requiredAttr = [
      "name",
      "firstName",
      "lastName",
      "password",
      "email",
      "phone",
    ];
    const result = validator.validateRequiredFields(requiredAttr, req.body);
    const emailRegexp =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!result.valid) {
      res.status(400).json({
        message:
          req.t("error.theseFieldsAreRequired") +
          result.requiredFields
            .map((field) => req.t(`field.${field}`))
            .join(", "),
      });
      return;
    } else if (!emailRegexp.test(req.body.email)) {
      res.status(400).json({
        message: req.t("error.emailIsNotValid"),
      });
      return;
    }

    const key = slugify(req.body.name, {
      replacement: "_",
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    }).toLowerCase();
    console.log("key", key);
    const existingCompany = await sequelizeAdmin.models.Company.findOne({
      where: { [Op.or]: [{ key }, { email: req.body.email }] },
    });
    console.log("existingCompany", existingCompany);
    if (existingCompany || key === "admin") {
      return res
        .status(400)
        .json({ message: req.t("auth.error.companyAlreadyExists") });
    }
    const user = {
      email: req.body.email,
      phone: req.body.phone,
      username: req.body.email,
      password: await createHashedPassword(req.body.password),
      roles: [ROLE.ADMIN],
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };

    const { connString } = await dbService.createDB(key, user);
    createSequelizeConnection(key, connString);

    let verificationCode = await createHashedPassword(req.body.email);
    verificationCode = verificationCode.replace(/[^\w ]/, "");
    const company = await sequelizeAdmin.models.Company.create({
      ...req.body,
      connectionString: connString,
      key,
      verificationCode,
    });

    await sendMail(
      req.body.email,
      "Potvrzení registrace",
      "src/email/user/",
      "registration",
      {
        link: `${process.env.FE_URI}/api/companies/${verificationCode}`,
        key,
        email: req.body.email,
      }
    );

    res.json({ success: true, company });
  } catch (error) {
    console.error("error", error);
    responseError(req, res, error);
  }
});

module.exports = router;
