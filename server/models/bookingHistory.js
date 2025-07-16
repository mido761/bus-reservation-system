const mongoose = require("mongoose");

const bookingHistory = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  shcedule: {
    type: Date,
    required: true,
  },
  checkInStatus: {
    type: Boolean,
    required: true,
  },
  paymentStatus: {
    type: Boolean,
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["booked", "cancelled", "completed"],
    default: "booked",
  },
  createdAt: { type: Date, default: Date.now },
});

const BookingHistory = mongoose.model("BookingHistory", bookingHistory);
module.exports = BookingHistory;
