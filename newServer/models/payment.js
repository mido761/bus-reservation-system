import { DateTime } from "luxon";
import mongoose from "mongoose";

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

export default mongoose.model("Payment", PaymentSchema);
