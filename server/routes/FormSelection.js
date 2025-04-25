const express = require("express");
const router = express.Router();
const Bus = require("../models/busForm");
// const Bus = require("../models/busModel");
const Seat = require("../models/seat");
const User = require("../models/user");
const innerAuth = require("../controllers/Inner Authorization");
const seat = require("../models/seat");

// retrieve bus details
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

// book seat endpoint
router.post("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { userId, destination } = req.body;

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

    const numberOfSeats = await Seat.countDocuments({ bookedBy: userId }); // count the number of seats for the user

    // Regular users can only book up to 2 seats per bus
    // if (
    //   !isAdmin 
    //   // user.seats.length > 1
    // ) {
    //   return res.status(400).json({
    //     message: "Only two seats are allowed per user on the same bus!",
    //   });
    // }
    if (!isAdmin && numberOfSeats > 1) {
      return res.status(400).json({
        message: "Only two seats are allowed per user on the same bus!",
      });
    }

    if (numberOfSeats > 0){
      const oldBus = await Seat.find({ bookedBy: userId }, {busId: 1}); // Get the bus of the user's seat
      const sameBus = oldBus[0].busId.toString() === busId; // ensure same bus

      // Regular users can't book in multiple buses
      if (!isAdmin &&  !sameBus) {
        return res.status(400).json({
          message: "Multiple Buses are not allowed!"
        });
      }      
    }

    // make the new seat 
    const newSeat = new Seat({
      busId: busId,
      bookedBy: userId,
      bookedTime: new Date(),
      bookerGender: user.gender,
      route: destination,
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

// cancel seat endpoint
router.delete("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { seatId, userId } = req.body;

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

    const isAdmin = innerAuth.isAuthorized(user); // Check if the user is an admin
    const isUserSeat = seat.bookedBy.toString() === userId; // ensure same user

    // Regular users can only cancel their own seats
    if (!isAdmin && !isUserSeat) {
      return res.status(400).json({
        message: "You can only cancel your seats!",
        isAdmin,
        isUserSeat,
      });
    }

    // Delete the seat
    await Seat.findByIdAndDelete(seatId);

    return res.status(200).json("Seat cancelled successfully.");
  } catch (error) {
    console.error("Error canceling the seat!", error);
    return res.status(404).json("Error canceling the seat!", error);
  }
});

module.exports = router;
