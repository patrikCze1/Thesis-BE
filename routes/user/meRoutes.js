const express = require("express");
const router = express.Router();
const { User, Group } = require("../../models/modelHelper");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Email = require("email-templates");

const { authenticateToken, getUser } = require("../../auth/auth");
const { transporter, APP_EMAIL, APP_NAME } = require("../../email/config");

/**
 * List of users groups
 */
router.get("/groups", authenticateToken, async (req, res) => {
  const user = getUser(req, res);

  try {
    const groups = await Group.findAll({
      where: {
        "$groupUser.id$": user.id,
      },
      include: [
        {
          model: User,
          as: "groupUser",
          attributes: [],
        },
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
    };
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

router.post("/forgotten-password", async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error("Email does not exist");
    else {
      // const mailOptions = {
      //   from: `"${APP_NAME}" <${APP_EMAIL}>`,
      //   to: email,
      //   subject: "Forgotten passoword",
      //   html: "This is an email test using Mailtrap.io",
      // };

      const token = jwt.sign({ email }, process.env.PASSWORD_SECRET, {
        expiresIn: parseInt(process.env.PASSWORD_SECRET_EXPIRATION),
      });

      // user.passwordResetHash = token;
      // await user.save();

      const emailObject = new Email({
        message: {
          to: email,
          from: `${APP_NAME} <${APP_EMAIL}>`,
          subject: "Forgotten passoword",
        },
        send: true,
        transport: transporter,
        views: {
          root: "./../../email/user/",
        },
      });

      emailObject
        .send({
          template: "reset-password",
          message: {
            to: email,
            from: `${APP_NAME} <${APP_EMAIL}>`,
          },
          locals: { link: `/obnova-hesla/?token=${token}` },
        })
        .then(console.log)
        .catch(console.error);

      // transporter.sendMail(mailOptions, (err, info) => {
      //   if (err) {
      //     console.log(err);
      //     return next(err);
      //   }

      //   res.json({
      //     message: "Email successfully sent.",
      //   });
      // });
      res.json({
        message: "Email successfully sent.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
