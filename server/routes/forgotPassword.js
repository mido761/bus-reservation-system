const express = require("express");
const { forgotPassword, resetPassword,resendVerificationCode } = require("../controllers/forgotPasswordController");

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-code", resendVerificationCode);

module.exports = router;
