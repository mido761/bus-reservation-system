const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Uses environment variable
    pass: process.env.EMAIL_PASS,
  },
});

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit code
}

router.post("/", async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;

  try {
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
      { name, phoneNumber, email, password, verificationCode },
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

router.post("/verify-email", async (req, res) => {
  try {
    const { token, enteredOtp } = req.body;
    // Decode the JWT
    const tempUser = jwt.verify(token, "ARandomStringThatIsHardToGuess12345");
    // console.log(String(tempUser.verificationCode));
    const code = tempUser.verificationCode


    // Validate the verification code
    if (code !== parseInt(enteredOtp)) {
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
