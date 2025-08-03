const express = require("express");
const router = express.Router();
const register = require("../controllers/authentication/registrationController")

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
router.post("/send-code", register.sendCode);


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
router.post("/verify-email", register.verifyUser);


/**
 * @route POST /api/register/resend-code
 * @description Resend verification code to user's email
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.token - Previous JWT token
 * @returns {Object} Success message and new JWT token
 * @throws {500} For internal server errors
 */
router.post("/resend-code", register.resendCode);


module.exports = router;
