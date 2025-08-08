const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  bookongId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  passanger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethode: {
    type: String,
    requried: true,
  },
  transactionId: {
    type: String,
    requried: true,
  },
  paymentStatus: {
    type: String,
    enum: ["sucsseful", "pending", "failed"],
    default: "pending",
  },
  timeStamp: {
    type: DateTime,
    required: true,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
