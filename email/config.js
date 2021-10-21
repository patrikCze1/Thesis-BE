const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "38c4f76da9e473",
    pass: "5addf4415b977e",
  },
});

const APP_NAME = "App";
const APP_EMAIL = "neodpovidat@app.cz";

exports.transporter = transporter;
exports.APP_NAME = APP_NAME;
exports.APP_EMAIL = APP_EMAIL;
