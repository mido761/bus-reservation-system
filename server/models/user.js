const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false },
  phoneNumber: { type: Number, required: false },
  email: { type: String, required: false },
  password: { type: String, required: false },
  checkInStatus: { type: Boolean, default: false }, // New field for check-in status
  gender: { type: String, enum: ["male", "female"], required: true }, // Added gender field
  bookedBuses: {
    buses: [{ type: String, required: false }],
    seats: [{ type: Number, required: false }]
  },
  role: { type: String, required: false, default: "user" },
});

module.exports = mongoose.model("User", UserSchema);
