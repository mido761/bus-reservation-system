import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  busIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus"
    },
  ],
  routeIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required:true
  }],
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

export default mongoose.model("Schedule", ScheduleSchema);
