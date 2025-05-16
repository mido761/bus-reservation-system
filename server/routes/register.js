const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

const jwt = require("jsonwebtoken");

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

/**
 * Generates a random 6-digit verification code
 * @returns {number} 6-digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit code
}

/**
 * @route POST /api/register
 * @description Register a new user and send verification email
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.phoneNumber - User's contact number
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {('Male'|'Female')} req.body.gender - User's gender
 * @returns {Object} Message and JWT token containing registration data
 * @throws {400} If email exists or gender is invalid
 * @throws {500} For internal server errors
 */
router.post("/", async (req, res) => {
  const { name, phoneNumber, email, password, gender } = req.body;

  try {
    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender. Choose male or female." });
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const verificationCode = generateVerificationCode();

    // req.session.tempUser = {
    //     name,
    //     phoneNumber,
    //     email,
    //     password, // Not hashed yet!
    //     verificationCode
    // };

    const token = jwt.sign(
      { name, phoneNumber, email, password, gender, verificationCode },
      "ARandomStringThatIsHardToGuess12345",
      { expiresIn: "10m" }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    });
    res.status(201).json({
      message: "Registration successful! Check your email for verification.",
      token: token,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Internal server error",  error: err.message});
  }
});

/**
 * @route POST /api/register/verify-email
 * @description Verify user's email with OTP and create account
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.token - JWT token containing registration data
 * @param {string} req.body.enteredOtp - Verification code entered by user
 * @returns {Object} Success message
 * @throws {400} If verification code is invalid
 * @throws {500} For internal server errors
 */
router.post("/verify-email", async (req, res) => {
  try {
    const { token, enteredOtp } = req.body;
    // Decode the JWT
    const tempUser = jwt.verify(token, "ARandomStringThatIsHardToGuess12345");
    // console.log(String(tempUser.verificationCode));
    const code = tempUser.verificationCode
    console.log(code)
    console.log(enteredOtp)

    // Validate the verification code
    if (Number(code) !== Number(parseInt(enteredOtp))) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(tempUser.password, 10);

    // Save the verified user in MongoDB
    const newUser = new User({
      name: tempUser.name,
      phoneNumber: tempUser.phoneNumber,
      email: tempUser.email,
      password: hashedPassword,
      gender: tempUser.gender,
      verified: true,
    });

    await newUser.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying email", error: error.message});
  }
});

/**
 * @route POST /api/register/resend-code
 * @description Resend verification code to user's email
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.token - Previous JWT token
 * @returns {Object} Success message and new JWT token
 * @throws {500} For internal server errors
 */
router.post("/resend-code", async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token
    const tempUser = jwt.verify(token, "ARandomStringThatIsHardToGuess12345");

    // Generate a new verification code
    const newVerificationCode = generateVerificationCode();

    // Create a new token with the updated verification code
    const newToken = jwt.sign(
      {
        name: tempUser.name,
        phoneNumber: tempUser.phoneNumber,
        email: tempUser.email,
        gender: tempUser.gender,
        password: tempUser.password,
        verificationCode: newVerificationCode,
      },
      "ARandomStringThatIsHardToGuess12345",
      { expiresIn: "10m" }
    );

    // Send the new verification code via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: tempUser.email,
      subject: "Verify Your Email",
      html: `<p>Your new verification code is: <strong>${newVerificationCode}</strong></p>`,
    });

    // Respond with success message & return new token
    res.json({ message: "New verification code sent!", newToken });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error sending new verification code",
        error: err.message,
      });
  }
});

module.exports = router;
