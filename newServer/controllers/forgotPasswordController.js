/**
 * @file forgotPasswordController.js
 * @description Controller handling password reset functionality including verification codes
 * @module ForgotPasswordController
 */

import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import nodemailer from "nodemailer";

/**
 * @function generateVerificationCode
 * @description Generates a random 6-digit verification code
 * @private
 * @returns {number} Six digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit code
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
};


export async function resetPassword(req, res) {
  const { email, otp, password } = req.body;
  const verificationCode = otp.join("");

  try {
    const user = await User.findOne({
      email,
      verificationCode,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired verification code" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(user._id, {
      $set: { password: hashedPassword },
      $unset: { verificationCode: 1, verificationCodeExpires: 1 },
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
export async function resendVerificationCode(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newCode = generateVerificationCode();
    user.verificationCode = newCode;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour validity
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
      subject: "Your New Password Reset Verification Code",
      html: `<p>Your new verification code is: <strong>${newCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "New verification code sent to email" });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

