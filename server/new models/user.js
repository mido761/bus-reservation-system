const mongoose = require("mongoose");

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
