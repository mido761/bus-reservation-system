const nodemailer = require("nodemailer");

/**
 * Nodemailer transporter configuration for sending verification emails
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Uses environment variable
    pass: process.env.EMAIL_PASS,
  },
});

module.exports.sendMail = async (recepient, subject, body) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recepient,
    subject: subject,
    html: body,
  });
};
