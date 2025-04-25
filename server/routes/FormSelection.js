const express = require("express");
const router = express.Router();
const Bus = require("../models/busForm");
// const Bus = require("../models/busModel");
const Seat = require("../models/seat")
const User = require("../models/user");
const innerAuth = require("../controllers/Inner Authorization");
const seat = require("../models/seat");

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
  const { userId,destination } = req.body;
  console.log(destination)
//   console.log(userId)
//   console.log(busId)
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
    // if (
    //   !isAdmin 
    //   // user.seats.length > 1
    // ) {
    //   return res.status(400).json({
    //     message: "Only two seats are allowed per user on the same bus!",
    //   });
    // }

    // let userOldSeat = busId;
    // let userSeat = userOldSeat;
    // if (user.seats.length>0){
    //    userOldSeat = await Seat.findById(user.seats[0]);
    //    userSeat = userOldSeat.busId
    // }
    // console.log(userOldSeat)
    // console.log(userSeat)
    // console.log(busId)

    // const seatsCount = await Seat.countDocuments({bookedBy: userId})
    // if (
    //   !isAdmin &&
    //   userSeat.toString() !== busId
    // ) { 
    //   return res.status(400).json({
    //     message: "you can't reserve in two buses",
    //   });
    // }
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
        route: destination,
    });
    await newSeat.save();

    await Bus.findByIdAndUpdate(
        busId,
        { $push: { bookedSeats: newSeat._id } },
        { new: true }
      );

    
    await User.findByIdAndUpdate(
        userId,
        { $push: { seats: newSeat._id}},
        { new: true }
      );

    return res.status(200).json({ message: "Seats booked successfully!" });
  } catch (error) {
    console.error("Error reserving seat:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.delete("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { seatId, userId } = req.body;
  console.log(seatId, userId)
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
    // const busId = seat.bus;

    const isAdmin = innerAuth.isAuthorized(user); // Check if the user is an admin
    const isUserSeat = seat.bookedBy.toString() === userId;

    // Regular users can only cancel their own seats 
    if (
      !isAdmin && !isUserSeat 
    ) {
      return res.status(400).json({
        message: "You can only cancel your seats!", isAdmin, isUserSeat
      });
    }

    // // Remove the seat ID from the Bus's seats array
    // await Bus.findByIdAndUpdate(busId, {
    //     $pull: {bookedSeats: seatId}
    // });

    // // Remove the seat ID from the User's Buses-seats array
    // await User.findByIdAndUpdate(userId,{
    //     $pull: {seats: seatId}
    // });

    // Delete the seat itself
    await Seat.findByIdAndDelete(seatId);

    return res.status(200).json("Seat cancelled successfully.", )
  } catch (error) {
    console.error("Error canceling the seat!", error);
    return res.status(404).json("Error canceling the seat!", error);
  }

});

module.exports = router;
