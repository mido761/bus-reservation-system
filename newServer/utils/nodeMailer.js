import nodemailer from "nodemailer";

/**
 * Nodemailer transporter configuration for sending verification emails
 */
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // Uses environment variable
//     pass: process.env.EMAIL_PASS,
//   },
// });

export async function sendMail(recepient, subject, body) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const mailRes = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recepient,
      subject: subject,
      html: body,
    });
    return mailRes;
  } catch (err) {
    throw new Error(err);
  }
}
