const express = require("express");
const router = express.Router();
const Bus = require("../models/busForm");   
const User = require("../models/user");
const Seat = require("../models/seat");
const innerAuth = require("../controllers/Inner Authorization");

router.get("/:id", async (req, res) => {
  try {
    const busId = req.params.id;
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.status(200).json(bus);
  } catch (err) {
    console.error("Error fetching bus details:", err);
    res
      .status(500)
      .json({ message: "Error fetching bus details", error: err.message });
  }
});

// router.post("/:busId", async (req, res) => {});

router.delete("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { seatId, userId } = req.body.data;

  try {
    const bus = await Bus.findById(busId);
    const user = await User.findById(userId);
    const seat = await Seat.findById(seatId);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    // Get the bus ID from the seat
    const busId = seat.bus;

    // Remove the seat ID from the Bus's seats array
    await Bus.findByIdAndUpdate(busId, {
        $pull: {bookedSeats: seatId}
    });

    // Remove the seat ID from the User's Buses-seats array
    await User.findByIdAndUpdate(userId,{
        $pull: {"bookedBuses.seats": seatId}
    });

    // Delete the seat itself
    await Seat.findByIdAndDelete(seatId);

    return res.status(200).json("Seat cancelled successfully.")
  } catch (error) {
    console.error("Error canceling the seat!", error);
    return res.status(404).json("Error canceling the seat!", error);
  }

});

module.exports = router;
