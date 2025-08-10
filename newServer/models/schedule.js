const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  busId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
    },
  ],
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
  },
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  // departureDate:{type:String,required:true},
  // arrivalDate:{type:String,required:true},
  avaibleSeats: { type: Number },
  Status: {
    type: String,
    enum: ["accepted", "cancelled", "completed", "pending", "failed"],
    default: "pending",
  },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
