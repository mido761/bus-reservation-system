/**
 * @file forgotPasswordController.js
 * @description Controller handling password reset functionality including verification codes
 * @module ForgotPasswordController
 */

import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { sendGridMail, nodeMailerMail } from "../utils/mailService.js";
// import { sendMail } from "../utils/nodeMailer.js";

/**
 * @function generateVerificationCode
 * @description Generates a random 6-digit verification code
 * @private
 * @returns {number} Six digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
}

export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const verificationCode = generateVerificationCode();

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      subject: "Password Reset Verification Code",
      html: `<p>Your password reset verification code is: <strong>${verificationCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /auth/request-reset
// app.post("/auth/request-reset", async (req, res) => {
export async function requestReset(req, res) {
  const { email } = req.body;

  try {
    // find user
    const { rows: user } = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );
    console.log(user);

    if (user.length === 0) {
      console.log(user);
      return res.status(400).json({ message: "This email does not exist!" });
    }

    const userId = user[0].user_id;

    // generate 6-digit OTP
    const otp = generateVerificationCode();
    // hash OTP with SHA-256
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // optional: delete old OTPs
    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [
      userId,
    ]);

    // store OTP in DB (plain or hashed)
    await pool.query(
      "INSERT INTO password_resets (user_id, otp_code, expires_at) VALUES ($1, $2, $3)",
      [userId, hashedOtp, expiresAt]
    );

    const subject = "Your Password Reset OTP";
    const body = `Your OTP is ${otp}. It expires in 5 minutes.`;
    const mailRes =
      process.env.NODE_ENV === "production"
        ? await sendGridMail(email, subject, body)
        : await nodeMailerMail(email, subject, body);
    console.log("Mail res: ", mailRes);

    return res.status(200).json({ message: "OTP code has been sent" });
  } catch (err) {
    console.error("Error sending OTP!", err);
    return res.status(500).json({ message: "Failed to send OTP code!" });
  }
}

// POST /auth/reset-password
export async function resetPassword(req, res) {
  const { email, otp, password } = req.body;
  console.log(email, otp, password);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // find user
    const user = await client.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid request" });
    }

    const userId = user.rows[0].user_id;

    // check OTP
    const result = await client.query(
      "SELECT otp_code, expires_at FROM password_resets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No OTP found" });
    }

    const entry = result.rows[0];

    if (entry.expires_at < new Date()) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "OTP expired" });
    }

    if (entry.expires_at < new Date()) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "OTP expired" });
    }

    const otp_string = otp.join("");
    const hashedInputOtp = crypto
      .createHash("sha256")
      .update(otp_string)
      .digest("hex");

    // console.log(otp, otp.join(""));
    // console.log(entry.otp_code, hashedInputOtp);

    if (entry.otp_code !== hashedInputOtp) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user password
    await client.query("UPDATE users SET password = $1 WHERE user_id = $2", [
      hashedPassword,
      userId,
    ]);

    // delete used OTP
    await client.query("DELETE FROM password_resets WHERE user_id = $1", [
      userId,
    ]);

    await client.query("COMMIT");
    return res.status(201).json({ message: "Password reset successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating password!", err);
    return res.status(500).json({ message: "Failed to reset password!" });
  }
}

// helper to hash OTP
function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function resendOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // check if there's already a reset entry for this email
    const { rows: user } = await pool.query(
      `SELECT user_id FROM users
       WHERE email = $1`,
      [email]
    );
    const userId = user[0].user_id;

    const { rows } = await pool.query(
      `SELECT * FROM password_resets 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );
    const entry = rows[0];

    if (!entry) {
      return res
        .status(400)
        .json({ error: "No reset request found for this email" });
    }

    const now = new Date();

    // enforce cooldown (e.g., 60 seconds)
    if (entry.last_sent_at && now - entry.last_sent_at < 60 * 1000) {
      return res
        .status(429)
        .json({ error: "Please wait before requesting another OTP" });
    }

    // enforce max resends (e.g., 3 times)
    if (entry.resend_count >= 3) {
      return res.status(429).json({ error: "Maximum resend attempts reached" });
    }

    // generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // valid 5 mins

    // update existing record
    await pool.query(
      `UPDATE password_resets
       SET otp_code = $1,
           expires_at = $2,
           last_sent_at = NOW(),
           resend_count = resend_count + 1
       WHERE id = $3`,
      [hashedOtp, expiresAt, entry.id]
    );

    const subject = "Your OTP Code";
    const body = `Your OTP is ${otp}. It expires in 5 minutes.`;
    const mailRes =
      process.env.NODE_ENV === "production"
        ? await sendGridMail(email, subject, body)
        : await nodeMailerMail(email, subject, body);
    console.log("Mail res: ", mailRes);

    return res.status(201).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// export async function resetPassword(req, res) {
//   const { email, otp, password } = req.body;
//   const verificationCode = otp.join("");

//   try {
//     const user = await User.findOne({
//       email,
//       verificationCode,
//       verificationCodeExpires: { $gt: Date.now() },
//     });

//     if (!user)
//       return res
//         .status(400)
//         .json({ message: "Invalid or expired verification code" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.findByIdAndUpdate(user._id, {
//       $set: { password: hashedPassword },
//       $unset: { verificationCode: 1, verificationCodeExpires: 1 },
//     });

//     res.json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// }

/**
 * @function resendVerificationCode
 * @description Generates and sends a new verification code to user's email
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 * @throws {404} If user not found
 * @throws {500} If email sending fails or other server error
 */
// export async function resendVerificationCode(req, res) {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const newCode = generateVerificationCode();
//     user.verificationCode = newCode;
//     user.verificationCodeExpires = Date.now() + 3600000; // 1 hour validity
//     await user.save();

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       to: user.email,
//       subject: "Your New Password Reset Verification Code",
//       html: `<p>Your new verification code is: <strong>${newCode}</strong></p>`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ message: "New verification code sent to email" });
//   } catch (error) {
//     console.error("Resend code error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// }
