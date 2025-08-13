const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  _id: "microbus_default_layout",
  name: "Standard Microbus Layout",
  totalSeats: 15,
  rows: [
    {
      rowNumber: 1,
      seats: [
        { seatNumber: "D", type: "driver", available: false },
        { seatNumber: "1", type: "passenger", available: true },
        { seatNumber: "2", type: "passenger", available: true },
      ],
    },
    {
      rowNumber: 2,
      seats: [
        { seatNumber: "3", type: "passenger", available: true },
        { seatNumber: "4", type: "passenger", available: true },
        { seatNumber: "5", type: "passenger", available: true },
      ],
    },
    {
      rowNumber: 3,
      seats: [
        { seatNumber: "6", type: "passenger", available: true },
        { seatNumber: "7", type: "passenger", available: true },
        { seatNumber: "8", type: "passenger", available: true },
      ],
    },
    {
      rowNumber: 4,
      seats: [
        { seatNumber: "9", type: "passenger", available: true },
        { seatNumber: "10", type: "passenger", available: true },
        { seatNumber: "11", type: "passenger", available: true },
      ],
    },
    {
      rowNumber: 5,
      seats: [
        { seatNumber: "12", type: "passenger", available: true },
        { seatNumber: "13", type: "passenger", available: true },
        { seatNumber: "14", type: "passenger", available: true },
        { seatNumber: "15", type: "passenger", available: true },
      ],
    },
  ],
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
