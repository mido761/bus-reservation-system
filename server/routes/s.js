const express = require("express");
const router = express.Router();
const Bus = require("../models/busModel");
const User = require("../models/user");
const Pusher = require("pusher");
const innerAuth = require("../controllers/Inner Authorization");
const mongoose = require("mongoose");

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
  const session = await mongoose.startSession();
  session.startTransaction(); // Start transaction

  const busId = req.params.busId;
  let { selectedSeats, userId } = req.body;
  const seats = Array.isArray(selectedSeats) ? selectedSeats.map(String) : selectedSeats.split(",").map(String);

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isAdmin = innerAuth.isAuthorized(user);

    // Prevent regular users from booking more than 2 seats
    if (!isAdmin) {
      const userBookedSeats = user.bookedBuses?.seats.length || 0;

      if (userBookedSeats + seats.length > 2) {
        return res.status(400).json({
          message: "Only two seats are allowed per user on the same bus!",
        });
      }
    }

    // Ensure selected seats are available
    const bus = await Bus.findById(busId).session(session);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found!" });
    }

    // Check if selected seats are already booked
    const alreadyBooked = seats.some((seat) => bus.seats.bookedSeats[seat] !== "0");
    if (alreadyBooked) {
      return res.status(400).json({ message: "Some selected seats are already booked" });
    }

    // Update seat booking in one atomic operation
    seats.forEach((seat) => {
      bus.seats.bookedSeats[seat] = userId;
    });

    // Reduce available seat count
    // bus.seats.availableSeats -= seats.length;
    await bus.save({ session });

    // Update user’s booking history
    user.bookedBuses.buses.addToSet(busId);
    user.bookedBuses.seats.push(...seats);
    await user.save({ session });

    // Commit transaction (finalize all changes)
    await session.commitTransaction();
    session.endSession();

    // Notify users via Pusher
    pusher.trigger("bus-channel", "seat-booked", {
      busId,
      selectedSeats: seats,
      userId,
    });

    return res.status(200).json({ message: "Seats booked successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error reserving seat:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


router.post("/reserve/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { selectedSeats, userId } = req.body.data;

  try {
    // Validate seat selection
    if (!selectedSeats || !Array.isArray(selectedSeats)) {
      return res.status(400).json({ message: "Invalid seat selection data" });
    }
    const seatStrings = selectedSeats.map(String);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = innerAuth.isAuthorized(user); // Check if the user is an admin
    const userBookedSeats = user.bookedBuses.buses.includes(busId)
      ? user.bookedBuses.seats.length
      : 0;

    // If the user is not an admin, enforce seat limits
    if (!isAdmin) {
      if (
        userBookedSeats + seatStrings.length > 2 &&
        user.bookedBuses.buses.includes(busId)
      ) {
        return res.status(400).json({
          message: "Only two seats allowed per user on the same bus!",
        });
      } else if (
        !user.bookedBuses.buses.includes(busId) &&
        user.bookedBuses.buses.length > 0
      ) {
        return res
          .status(400)
          .json({ message: "Can't book seats on multiple buses!" });
      }
    }

    // Check if all selected seats are already reserved by the user
    const allReservedByUser = await Bus.exists({
      _id: busId,
      $and: seatStrings.map((seatNumber) => ({
        "seats.reservedSeats": {
          $elemMatch: { seatNumber: seatNumber, reservedBy: userId },
        },
      })),
    });

    if (Boolean(allReservedByUser)) {
      return res
        .status(202)
        .json({ message: "Proceeding to payment", code: "PROCEED_TO_PAYMENT" });
    }

    // Attempt to reserve seats
    const updatedBus = await Bus.findOneAndUpdate(
      {
        _id: busId,
        $and: seatStrings.map((seatNumber) => ({
          "seats.reservedSeats.seatNumber": { $ne: seatNumber }, // Ensure seat is not already reserved
        })),
      },
      {
        $push: {
          "seats.reservedSeats": {
            $each: seatStrings.map((seatNumber) => ({
              seatNumber,
              reservedBy: userId,
              expiryDate: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
            })),
          },
        },
        $inc: { "seats.availableSeats": -seatStrings.length },
      },
      { new: true }
    );

    if (!updatedBus) {
      return res
        .status(400)
        .json({ message: "Some or all selected seats are already reserved" });
    }

    // Notify users in real time
    pusher.trigger("bus-channel", "seat-reserved", { busId, updatedBus });

    return res
      .status(200)
      .json({ message: "Seats reserved successfully", updatedBus });
  } catch (error) {
    console.error("Error reserving seat:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.delete("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { selectedSeats, userId } = req.body;

  const seatStrings = selectedSeats.map(String);

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

    const BookedUserIds = [
      ...new Set(selectedSeats.map((i) => bus.seats.bookedSeats[i]).filter((seat) => seat !== '0')),
    ];

    if (user.role === "admin") {
      const busData = await Bus.findOne(
        { _id: busId },
        { "seats.reservedSeats": 1 } // Fetch reservedSeats only
      );

      if (!busData) {
        return res.status(404).json({ message: "Bus not found" });
      }

      const updatedBus = await Bus.findByIdAndUpdate(
        busId,
        {
          $set: seatUpdates,
          $pull: {
            "seats.reservedSeats":
              user.role === "admin"
                ? { seatNumber: { $in: seatStrings } } // Admin removes any seat
                : { seatNumber: { $in: seatStrings }, reservedBy: userId }, // User removes only their own
          },
          $inc: { "seats.availableSeats": selectedSeats.length },
        },
        { new: true }
      );

      if (updatedBus) {
        pusher.trigger("bus-channel", "seat-canceled", {
          updatedBus,
        });
      }

      // Remove the selected seat numbers from each user's bookedBuses.seats
      await User.updateMany(
        { _id: { $in: BookedUserIds } },
        { $pull: { "bookedBuses.seats": { $in: selectedSeats } } }
      );

      // check if any user has no more booked seats and remove the bus
      const usersToRemoveBus = await User.find({
        _id: { $in: BookedUserIds },
        "bookedBuses.seats": { $size: 0 }, // Users with no remaining booked seats
      });

      const usersToRemoveIds = usersToRemoveBus.map((u) => u._id);

      if (usersToRemoveIds.length > 0) {
        await User.updateMany(
          { _id: { $in: usersToRemoveIds } },
          { $pull: { "bookedBuses.buses": busId } }
        );
      }

      return res.json({
        // BookedUserIds,
        message: "Users updated successfully",
        updatedBus,
      });
    }

    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      {
        $set: seatUpdates,
        $pull: {
          "seats.reservedSeats":
            user.role === "admin"
              ? { seatNumber: { $in: seatStrings } } // Admin removes any seat
              : { seatNumber: { $in: seatStrings }, reservedBy: userId }, // User removes only their own
        },
        $inc: { "seats.availableSeats": selectedSeats.length },
      },
      { new: true }
    );

    if (updatedBus) {
      pusher.trigger("bus-channel", "seat-canceled", {
        updatedBus,
      });

      // Remove selected seats from the user's booked seats
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { "bookedBuses.seats": { $in: selectedSeats } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found");
      }

      // Check if the user still has any booked seats either in the bus or in the user's record
      const busSeats = updatedBus.seats.bookedSeats;
      const userStillBookedSeats =
        busSeats.includes(userId) || updatedUser.bookedBuses.seats.length > 0;

      // If no seats remain, remove the bus from the user's booked buses
      if (!userStillBookedSeats) {
        await User.findByIdAndUpdate(userId, {
          $pull: { "bookedBuses.buses": busId },
        });
      }

      return res
        .status(200)
        .json({ message: "Seats canceled successfully", updatedBus });
    }
  } catch (err) {
    console.error("There was an error canceling the seat: ", err);
    res.status(500).json({ message: "Internal server error", err });
  }
});

// router.get("/passenger/:id", async (req, res) => {
//     try {
//         const busId = req.params.id;
//         const {userId} = req.body;
//         const bus = await Bus.findById(busId);
//         if (!bus){
//             return res.status(404).json({ message: "Bus not found" });
//         }

//         const seats = await Seat.find({busId: busId}, {bookedBy:1,route : 1});
//         let userSeat = [];
//         for (let i = 0; i < seats.length ; i++ ){
//             if (seats[i].bookedBy == userId){
//                 userSeat.push([i+1,seats[i].route]);
//             }
//         }
//         console.log(seats)
//         const seatsNum = seats.length
//         res.status(200).json({ message: "Current seats:", data: { seatsNum , userSeat} }); // ✅
//     }catch (err) {
//         console.error("Error fetching seats:", err);
//         res
//           .status(500)
//           .json({ message: "Error fetching seats", error: err.message });
//       }

// })



module.exports = router;


// MONGO_URI = mongodb://127.0.0.1:27017/bus-system?replicaSet=rs0
