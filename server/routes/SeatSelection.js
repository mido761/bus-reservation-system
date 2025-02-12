const express = require("express");
const router = express.Router();
const Bus = require("../models/busModel");
const User = require("../models/user");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

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
  const { selectedSeats, userId } = req.body;
  const seats = selectedSeats.split(",").map(Number);

  try {
    const bus = await Bus.findById(busId);
    const user = await User.findById(userId);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    for (let i = 0; i < seats.length; i++) {
      // if(bus.seats.bookedSeats[(seats[i])] !== "0"){
      //   return res.status(400).json(seats[i]);
      // }
      const fieldToUpdate = `seats.bookedSeats.${[seats[i]]}`;

      if (bus.seats.bookedSeats[seats[i]] !== "0") {
        return res.status(400).json({
          message: `Seat ${seats[i]} is already booked for bus ${busId}`,
          seat: seats[i],
          busId,
        });
      }
      const updatedBus = await Bus.findByIdAndUpdate(
        busId,
        { $set: { [fieldToUpdate]: userId } },
        { new: true }
      );

      if (updatedBus) {
        pusher.trigger("bus-channel", "seat-booked", {
          busId: busId,
          selectedSeats: seats,
          userId: userId,
        });
      }
    }

    if (user.bookedBuses.buses.indexOf(busId) === -1) {
      const userBookedBuses = await User.updateOne(
        { _id: userId },
        { $push: { "bookedBuses.buses": busId } },
        { new: true }
      );
    }

    res.status(200).json({ message: "Seat booked successfully" });
  } catch (error) {
    console.error("Error reserving seat:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/reserve/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { selectedSeats, userId } = req.body.data;

  console.log("Selected Seats:", selectedSeats);
  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Check if any of the selected seats are already reserved or booked
    const alreadyReservedOrBooked = selectedSeats.filter(
      (seat) =>
        bus.seats.reservedSeats.includes(seat) ||
        bus.seats.reservedSeats.some((r) => r.seatNumber === String(seat))
    );

    const userBooked = bus.seats.reservedSeats.filter((seat) => seat.reservedBy === userId).map((seat) => seat.seatNumber);
    const allSeatsReserved = selectedSeats.every((seat) => userBooked.includes(String(seat)));

    console.log("User Booked:", userBooked);
    if (alreadyReservedOrBooked.length > 0 && !(allSeatsReserved)) {
      return res.status(400).json({
        message: "Some seats are already reserved or booked",
        seats: alreadyReservedOrBooked,
      });
    }

    if (allSeatsReserved) {
      return res.status(302).json({
        message: "You have already reserved some seats",
        seats: userBooked,
      });
    }

    // Reserve the seats with expiration logic
    const reservations = selectedSeats.map((seatNumber) => ({
      seatNumber,
      reservedBy: userId,
      expiryDate: new Date(Date.now() + 10 * 60 * 1000), // 10-minute expiration
    }));

    // Update reservedSeats in one step to avoid duplication
    bus.seats.reservedSeats.push(...reservations);
    const updatedBus = await bus.save();

    if (updatedBus) {
      pusher.trigger("bus-channel", "seat-reserved", {
        updatedBus,
      });
      console.log("Reserved seats:", updatedBus.seats.reservedSeats);
    }

    res.status(200).json({ message: "Seat reserved successfully" });
  } catch (error) {
    console.error("Error reserving seat:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.delete("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { selectedSeats, userId } = req.body;

  try {
    const bus = await Bus.findById(busId);
    const user = await User.findById(userId);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const seatUpdates = selectedSeats.reduce((acc, seat) => {
      acc[`seats.bookedSeats.${seat}`] = "0";
      return acc;
    }, {});
    const reservedSeatUpdates = selectedSeats.reduce((acc, seat) => {
      acc[`seats.reservedSeats.${seat}`] = "0";
      return acc;
    }, {});


    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      {
        $set: seatUpdates,
        $pull: {
          "seats.reservedSeats": { seatNumber:{$in: selectedSeats}, reservedBy: userId },
        },
      },
      { new: true }
    );

    if (updatedBus) {
      pusher.trigger("bus-channel", "seat-canceled", {
        updatedBus
      });
      // const busSeats = bus.seats.bookedSeats;
      // const userHasBookedSeats = busSeats.some((seat) => seat === userId);
      // Check if the user still has any booked seats on this bus
      const busSeats = updatedBus.seats.bookedSeats;

      // Check if any seat is still booked by the user
      const userHasOtherBookedSeats = busSeats.some(
        (seat) => seat === userId // Check if the user's ID exists in any booked seat
      );
      console.log(busSeats);

      // If no seats are booked by the user, remove the bus from the user's booked buses
      if (!userHasOtherBookedSeats) {
        await User.findByIdAndUpdate(userId, {
          $pull: { "bookedBuses.buses": busId },
        });
      }

      res
        .status(200)
        .json({ message: "Seats canceled successfully", updatedBus });

      // for(let i = 0; i < selectedSeats.length; i++){
      //   // if(bus.seats.bookedSeats[(seats[i])] !== "0"){
      //   //   return res.status(400).json(seats[i]);
      //   // }
      //   const fieldToUpdate = `seats.bookedSeats.${[selectedSeats[i]]}`;
      //   const updatedBus = await Bus.findByIdAndUpdate(
      //     busId,
      //     {$set: {fieldToUpdate:"0"}},
      //     {new : true}
      //   );
      // }

      // if (user.bookedBuses.buses.indexOf(busId) === -1){
      //   const userBookedBuses = await User.updateOne(
      //     {_id : userId},
      //     {$pull: {'bookedBuses.buses': busId}},
      //   );
      // }
    }
  } catch (err) {
    console.error("There was an error canceling the seat: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
