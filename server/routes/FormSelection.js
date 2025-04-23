const express = require("express");
const router = express.Router();
// const Bus = require("../models/busForm");
const Bus = require("../models/busModel");
const Seat = require("../models/seat")
const User = require("../models/user");
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


router.post("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { userId } = req.body;
  console.log(userId)
  console.log(busId)
//   const seats = selectedSeats.split(",").map(Number);

  try {
    const user = await User.findById(userId);
    const bus = await Bus.findById(busId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!bus) {
      return res.status(404).json({ message: "Bus not found!" });
    }
    const isAdmin = innerAuth.isAuthorized(user); // Check if the user is an admin

    // Regular users can only book up to 2 seats per bus
    if (
      !isAdmin &&
      user.bookedBuses.buses.includes(busId) &&
      user.bookedBuses.seats.length + seats.length > 2
    ) {
      return res.status(400).json({
        message: "Only two seats are allowed per user on the same bus!",
      });
    }

    // Ensure all selected seats are available
    // const seatQuery = {
    //   _id: busId,
    //   $and: seats.map((seat) => ({ [`seats.bookedSeats.${seat}`]: 0 })), // Ensure seats are free
    // };

    const newSeat = new Seat({
        busId: busId,
        bookedBy: userId,
        bookedTime:  new Date(),
        bookerGender: user.gender,
    });
    
        await newSeat.save();
    

    return res.status(200).json({ message: "Seats booked successfully!" });
  } catch (error) {
    console.error("Error reserving seat:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});



module.exports = router;
