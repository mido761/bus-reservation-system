import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

// /**
//  * Nodemailer transporter configuration for sending verification emails
//  */
// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER, // Uses environment variable
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// import { Resend } from "resend";

async function sendGridMail(recepient, subject, body) {
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });

  // try {
  //   const mailRes = await transporter.sendMail({
  //     from: process.env.EMAIL_USER,
  //     to: recepient,
  //     subject: subject,
  //     html: body,
  //   });
  //   return mailRes;
  // } catch (err) {
  //   throw new Error(err);
  // }

  // const resend = new Resend("re_UqYZYWHT_2PouqE3uLZW39jTAEjiteK4p");

  // try {
  //   const mailRes = await resend.emails.send({
  //     from: "midoteraq@gmail.com",
  //     to: recepient,
  //     subject: subject,
  //     html: body,
  //   });
  //   return mailRes;
  // } catch (err) {
  //   throw new Error(err);
  // }
}

async function nodeMailerMail(to, subject, html) {
  // console.log(process.env.SENDGRID_API_KEY)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  try {
    const msg = {
      to,
      from: process.env.EMAIL_USER,
      subject,
      html,
    };
    return await sgMail.send(msg);
  } catch (err) {
    console.error("SendGrid error:", err);
    throw err;
  }
}

export { sendGridMail, nodeMailerMail };
