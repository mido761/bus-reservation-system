const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false },
  phoneNumber: { type: Number, required: false },
  email: { type: String, required: false },
  password: { type: String, required: false },
  checkInStatus: { type: Boolean, default: false }, // New field for check-in status
  bookedBuses: {
    buses: [{ type: String, required: false }],
    seats: [{ type: Number, required: false }],
  },
  role: { type: String, required: false, default: "user" },
  resetToken: { type: String, required: false },
  resetTokenExpires: {
    type: Date,
    required: false,
    default: () => new Date(Date.now() + 10*  60 * 1000),
  },
});

module.exports = mongoose.model("User", UserSchema);
