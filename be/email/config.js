const nodemailer = require("nodemailer");
const Email = require("email-templates");
const path = require("path");

const APP_NAME = "Jago";
const APP_EMAIL = "neodpovidat@jago.cz";

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  //   secure: process.env.NODE_ENV !== "production",
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

/**
 *
 * @param {string} to
 * @param {string} subject
 * @param {string} templatePath
 * @param {string} template
 * @param {Object} locals
 * @returns
 */
const sendMail = async (to, subject, templatePath, template, locals = {}) => {
  // console.log("send mail ", to, subject, templatePath, template, locals);
  const dir = path.resolve(templatePath);
  const emailObject = new Email({
    message: {
      to,
      from: `${APP_NAME} <${APP_EMAIL}>`,
      subject,
    },
    send: true,
    transport: transporter,
    views: {
      root: dir,
    },
    preview: false, //preview in browser
  });

  try {
    return await emailObject.send({
      template,
      message: {
        to,
        from: `${APP_NAME} <${APP_EMAIL}>`,
      },
      locals,
    });
  } catch (error) {
    console.error("sendMail ", error);
  }
};

exports.sendMail = sendMail;
exports.APP_NAME = APP_NAME;
exports.APP_EMAIL = APP_EMAIL;
