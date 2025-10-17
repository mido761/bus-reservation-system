dotenv.config();
import jwt from "jsonwebtoken";
import { sendGridMail, nodeMailerMail } from "../utils/mailService.js";
import bcrypt from "bcrypt";
import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();
/**
 * Generates a random 6-digit verification code
 * @returns {number} 6-digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit code
}

export async function sendCode(req, res) {
  const { name, phoneNumber, email, password, gender } = req.body;

  try {
    if (!["Male", "Female"].includes(gender)) {
      return res
        .status(400)
        .json({ message: "Invalid gender. Choose male or female." });
    }
    const emailLower = email.toLowerCase();
    // console.log(email, emailLower)
    const checkUser = `
    SELECT * FROM users
    WHERE email = $1
    `;

    const { rows } = await pool.query(checkUser, [emailLower]);
    // console.log(rows);
    // const userExist = await User.findOne({ email });
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const verificationCode = generateVerificationCode();

    const token = jwt.sign(
      { name, phoneNumber, email: emailLower, password, gender, verificationCode },
      "ARandomStringThatIsHardToGuess12345",
      { expiresIn: "10m" }
    );

    const subject = "Verify Your Email";
    const body = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;
    const mailRes = await nodeMailerMail(emailLower, subject, body);
    // console.log("Mail res: ", mailRes);

    return res.status(201).json({
      message: "Registration successful! Check your email for verification.",
      token: token,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

export async function verifyUser(req, res) {
  try {
    const { token, enteredOtp } = req.body;
    // Decode the JWT
    const tempUser = jwt.verify(token, "ARandomStringThatIsHardToGuess12345");

    const code = tempUser.verificationCode;

    // console.log(enteredOtp, code, Number(code) !== Number(enteredOtp));

    // Validate the verification code
    if (Number(code) !== Number(enteredOtp)) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(tempUser.password, 10);

    const insertNewUser = `
      INSERT INTO users (
      username,
      phone_number,
      email,
      password,
      gender
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id;
    `;

    const { user } = await pool.query(insertNewUser, [
      tempUser.name,
      tempUser.phoneNumber,
      tempUser.email,
      hashedPassword,
      tempUser.gender,
    ]);

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying email", error: error.message });
  }
}

export async function resendCode(req, res) {
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

    const email = tempUser.email;
    // console.log("Resending code to:", tempUser);
    const subject = "Verify Your Email";
    const body = `<p>Your verification code is: <strong>${newVerificationCode}</strong></p>`;

    const mailRes = await nodeMailerMail(email, subject, body);
    // console.log("Mail res: ", mailRes);

    // Respond with success message & return new token
    return res.json({
      message: "New verification code sent!",
      newToken: newToken,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error sending new verification code",
      error: err.message,
    });
  }
}
