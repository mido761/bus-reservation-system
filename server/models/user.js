const mongoose = require("mongoose");

/**
 * @typedef {Object} User
 * @property {string} name - The user's full name
 * @property {number} phoneNumber - The user's contact number
 * @property {string} email - The user's email address
 * @property {string} password - The user's hashed password
 * @property {('Male'|'Female')} gender - The user's gender
 * @property {string} role - The user's role in the system (default: "user")
 * @property {string} verificationCode - Code sent for email verification
 * @property {Date} verificationCodeExpires - Expiration timestamp for verification code
 */

/**
 * Mongoose schema for User model
 * @type {mongoose.Schema<User>}
 */
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: false,
    trim: true
  },
  phoneNumber: { 
    type: Number, 
    required: false 
  },
  email: { 
    type: String, 
    required: false,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: false 
  },
  // checkInStatus: { type: Boolean, default: false }, // New field for check-in status
  gender: { 
    type: String, 
    enum: ["Male", "Female"], 
    required: false, 
    default: "Male" 
  },
  // seats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seat" }],
  // bookedTime: [{type: Date, required:false}],
  role: { 
    type: String, 
    required: false, 
    default: "user" 
  },
  verificationCode: { 
    type: String, 
    required: false 
  },
  verificationCodeExpires: {
    type: Date,
    required: false,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
  },
});

module.exports = mongoose.model("User", UserSchema);
