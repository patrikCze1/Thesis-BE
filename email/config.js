const nodemailer = require("nodemailer");
const Email = require("email-templates");
const path = require("path");

const APP_NAME = "App";
const APP_EMAIL = "neodpovidat@app.cz";

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  //   secure: process.env.NODE_ENV !== "production",
  auth: {
    user: "38c4f76da9e473",
    pass: "5addf4415b977e",
  },
});

const sendMail = async (to, subject, templatePath, template, locals = {}) => {
  const dir = path.resolve(templatePath);
  const emailObject = new Email({
    message: {
      to: to,
      from: `${APP_NAME} <${APP_EMAIL}>`,
      subject: subject,
    },
    send: true,
    transport: transporter,
    views: {
      root: dir,
    },
  });

  return emailObject.send({
    template: template,
    message: {
      to: to,
      from: `${APP_NAME} <${APP_EMAIL}>`,
    },
    locals: locals,
  });
};

// exports.transporter = transporter;
exports.sendMail = sendMail;
exports.APP_NAME = APP_NAME;
exports.APP_EMAIL = APP_EMAIL;
