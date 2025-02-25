const express = require("express");
const router = express.Router();
const Bus = require("../models/busModel");
const User = require("../models/user");
const Pusher = require("pusher");
const middleware = require("../controllers/middleware");

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
    const user = await User.findById(userId);
    console.log(
      user.bookedBuses.buses.length,
      user.bookedBuses.seats.length,
      user.bookedBuses.buses[0] === busId
    );
    if (
      user.bookedBuses.buses.length > 0 &&
      user.bookedBuses.seats.length >= 2 &&
      user.bookedBuses.buses[0] === busId
    ) {
      return res
        .status(400)
        .json("Only two seats are allowed for the same bus!");
    } else if (
      user.bookedBuses.seats.length < 2 &&
      (user.bookedBuses.buses.length === 0 ||
        user.bookedBuses.buses[0] === busId)
    ) {
      const updatedBus = await Bus.findOneAndUpdate(
        {
          _id: busId,
          $and: seats.map((seat) => ({
            [`seats.bookedSeats.${seat}`]: "0", // Ensure seat is available
          })),
        },
        {
          $set: Object.fromEntries(
            seats.map((seat) => [`seats.bookedSeats.${seat}`, userId])
          ),
        },
        { new: true }
      );

      // If no bus was updated, it means some seats were already booked
      if (!updatedBus) {
        return res
          .status(400)
          .json({ message: "Some selected seats are already booked", busId });
      }

      // Notify other users via Pusher
      pusher.trigger("bus-channel", "seat-booked", {
        busId,
        selectedSeats: seats,
        userId,
      });

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          // $expr: {
          //   $and: [
          //     { $eq: [ { $size: "$bookedBuses.buses" }, 1 ] },
          //     { $lt: [ { $size: "$bookedBuses.seats" }, 3 ] }
          //   ]
          // }
        },
        {
          $addToSet: {
            "bookedBuses.buses": busId,
            "bookedBuses.seats": { $each: seats },
          },
        },
        { new: true }
      );

      // Check if the bus needs to be duplicated

      const availableBusesCount = await Bus.countDocuments({
        "location.pickupLocation": updatedBus.location.pickupLocation,
        "time.departureTime": updatedBus.time.departureTime,
        "seats.availableSeats": { $gt: 0 },
      });

      if (availableBusesCount === 0) {
        try {
          const newBus = new Bus({
            seats: {
              totalSeats: 20,
              availableSeats: 15,
              bookedSeats: Array.from(
                { length: 20 },
                () => 0
              ),
            },
            schedule: updatedBus.schedule,
            price: updatedBus.price,
            minNoPassengers: updatedBus.minNoPassengers,
            location: {
              pickupLocation: updatedBus.location.pickupLocation,
              arrivalLocation: updatedBus.location.arrivalLocation,
            },
            time: {
              departureTime: updatedBus.time.departureTime,
              arrivalTime: updatedBus.time.arrivalTime,
            },
            allowance: {
              cancelTimeAllowance: updatedBus.allowance.cancelTimeAllowance,
              bookingTimeAllowance: updatedBus.allowance.bookingTimeAllowance,
            },
            allowedNumberOfBags: updatedBus.allowedNumberOfBags,
          });

          await newBus.save();
          return res
            .status(200)
            .json({ message: "Seats booked successfully and Bus Duplicated." });
        } catch (error) {
          console.error("Error duplicating bus:", error);
          return res.status(500).json({ message: "Error duplicating bus" }); // Return in case of failure
        }
      }

      return res.status(200).json({ message: "Seat booked successfully" });
    } else if (user.bookedBuses.buses[0] !== busId) {
      return res.status(400).json("Can't book multiple Buses!");
    }
  } catch (error) {
    console.error("Error reserving seat:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/reserve/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { selectedSeats, userId } = req.body.data;

  // Ensure selectedSeats is a valid array and convert to strings
  if (!selectedSeats || !Array.isArray(selectedSeats)) {
    return res.status(400).json({ message: "Invalid seat selection data" });
  }
  const seatStrings = selectedSeats.map(String);

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Count total seats already reserved by the user for this bus
  const userBookedSeats = user.bookedBuses.buses.includes(busId)
    ? user.bookedBuses.seats.length
    : 0;

  console.log(
    userBookedSeats + seatStrings.length > 2,
    user.bookedBuses.buses.includes(busId)
  );
  // Check if booking exceeds the max seat limit (2 per bus)
  if (
    userBookedSeats + seatStrings.length > 2 &&
    user.bookedBuses.buses.includes(busId)
  ) {
    return res.status(400).json({
      message: "Only two seats are allowed per user for the same bus!",
    });
  } else if (!user.bookedBuses.buses.includes(busId) && user.bookedBuses.buses.length > 0) {
    return res.status(400).json({
      message: "Can't book in multiple buses!",
    });
  }

  const allReservedByUser = await Bus.exists({
    _id: busId,
    $and: seatStrings.map((seatNumber) => ({
      "seats.reservedSeats": {
        $elemMatch: {
          seatNumber: seatNumber,
          reservedBy: userId,
        },
      },
    })),
  });

  if (Boolean(allReservedByUser)) {
    return res.status(202).json({
      message: "Proceeding to payment",
      code: "PROCEED_TO_PAYMENT",
    });
  }

  try {
    const updatedBus = await Bus.findOneAndUpdate(
      {
        _id: busId,
        "seats.reservedSeats": {
          $not: { $elemMatch: { seatNumber: { $in: seatStrings } } },
        },
      },
      {
        $push: {
          "seats.reservedSeats": {
            $each: seatStrings.map((seatNumber) => ({
              seatNumber,
              reservedBy: userId,
              expiryDate: new Date(Date.now() + 10 * 60 * 1000),
            })),
          },
        },
        $inc: { "seats.availableSeats": -seatStrings.length },
      },
      { new: true }
    );

    if (!updatedBus) {
      return res.status(400).json({
        message: "Some or all of the selected seats are already reserved",
      });
    }

    // Notify all users in real-time
    pusher.trigger("bus-channel", "seat-reserved", {
      busId,
      updatedBus: updatedBus,
    });

    return res
      .status(200)
      .json({ message: "Seats reserved successfully", updatedBus });
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
          "seats.reservedSeats": {
            seatNumber: { $in: selectedSeats },
            reservedBy: userId,
          },
        },
        $inc: { "seats.availableSeats": selectedSeats.length },
      },
      { new: true }
    );

    if (updatedBus) {
      pusher.trigger("bus-channel", "seat-canceled", {
        updatedBus,
      });
      // const busSeats = bus.seats.bookedSeats;
      // const userHasBookedSeats = busSeats.some((seat) => seat === userId);
      // Check if the user still has any booked seats on this bus
      const busSeats = updatedBus.seats.bookedSeats;

      // Check if any seat is still booked by the user
      const userHasOtherBookedSeats = busSeats.some(
        (seat) => seat === userId // Check if the user's ID exists in any booked seat
      );

      const userHasBookedSeats = user.bookedBuses.seats.length > 0;

      // If no seats are booked by the user, remove the bus from the user's booked buses
      if (!userHasOtherBookedSeats && !userHasBookedSeats) {
        await User.findByIdAndUpdate(userId, {
          $pull: { "bookedBuses.buses": busId },
        });
      } else {
        User.findOneAndUpdate(
          { _id: userId },
          { $pull: { "bookedBuses.seats": { $in: selectedSeats } } },
          { new: true } // Returns updated user data
        )
          .then((updatedUser) => {
            if (!updatedUser) {
              throw new Error("User not found");
            }
            const userHasBookedSeats = updatedUser.bookedBuses.seats.length > 0;
            if (!userHasBookedSeats) {
              return User.findOneAndUpdate(
                { _id: userId },
                { $pull: { "bookedBuses.buses": busId } }, // Remove the bus if no seats left
                { new: true }
              );
            }
          })
          .catch((error) => {
            console.error("Error updating user: ", error);
          });
      }

      return res
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
    res.status(500).json({ message: "Internal server error", err });
  }
});

module.exports = router;
