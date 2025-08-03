/**
 * @file forgotPassword.js
 * @description Handles password reset functionality including email verification
 * @module ForgotPasswordRoutes
 */

const express = require("express");
const { forgotPassword, resetPassword, resendVerificationCode } = require("../controllers/forgotPasswordController");

const router = express.Router();

/**
 * @route POST /api/forgot-password
 * @description Initiates password reset process by sending verification code
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * @returns {Object} Message confirming verification code sent
 * @throws {404} If user email not found
 * @throws {500} For server errors
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route POST /api/reset-password
 * @description Resets user password with verification code
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.code - Verification code
 * @param {string} req.body.newPassword - New password
 * @returns {Object} Message confirming password reset
 * @throws {400} If verification code is invalid
 * @throws {404} If user not found
 * @throws {500} For server errors
 */
router.post("/reset-password", resetPassword);

/**
 * @route POST /api/resend-code
 * @description Resends verification code to user's email
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * @returns {Object} Message confirming new code sent
 * @throws {404} If user not found
 * @throws {429} If too many resend attempts
 * @throws {500} For server errors
 */
router.post("/resend-code", resendVerificationCode);

module.exports = router;
