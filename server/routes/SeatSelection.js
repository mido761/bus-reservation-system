const express = require("express");
const router = express.Router();
const Bus = require("../models/busModel");
const User = require("../models/user");
const Pusher = require("pusher");
const innerAuth = require("../controllers/Inner Authorization");

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
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
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
    const seatQuery = {
      _id: busId,
      $and: seats.map((seat) => ({ [`seats.bookedSeats.${seat}`]: "0" })), // Ensure all seats are free
    };

    const seatUpdate = {
      $set: Object.fromEntries(
        seats.map((seat) => [`seats.bookedSeats.${seat}`, userId])
      ), // Assign user to seats
    };

    const updatedBus = await Bus.findOneAndUpdate(seatQuery, seatUpdate, {
      new: true,
    });

    // If no document was updated, it means some seats were already booked
    if (!updatedBus) {
      return res
        .status(400)
        .json({ message: "Some selected seats are already booked" });
    }

      // Notify other users via Pusher
      pusher.trigger("bus-channel", "seat-booked", {
        busId,
        selectedSeats: seats,
        userId,
      });

    // Update the user's booking history
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          "bookedBuses.buses": busId,
          "bookedBuses.seats": { $each: seats },
        },
      },
      { new: true }
    );

    // Check if a duplicate bus is needed
    const availableBusesCount = await Bus.countDocuments({
      "location.pickupLocation": updatedBus.location.pickupLocation,
      "location.arrivalLocation": updatedBus.location.arrivalLocation,
      "time.departureTime": updatedBus.time.departureTime,
      "seats.availableSeats": { $gt: 0 },
    });

    if (availableBusesCount === 0) {
      try {
        const newBus = new Bus({
          seats: {
            totalSeats: 20,
            availableSeats: 15,
            bookedSeats: Array(20).fill(0), // Empty seats
          },
          schedule: updatedBus.schedule,
          price: updatedBus.price,
          minNoPassengers: updatedBus.minNoPassengers,
          location: updatedBus.location,
          time: updatedBus.time,
          allowance: updatedBus.allowance,
          allowedNumberOfBags: updatedBus.allowedNumberOfBags,
        });

        await newBus.save();
        return res
          .status(200)
          .json({ message: "Seats booked successfully and bus duplicated." });
      } catch (error) {
        console.error("Error duplicating bus:", error);
        return res.status(500).json({ message: "Error duplicating bus" });
      }
    } 

    return res.status(200).json({ message: "Seats booked successfully!" });
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

      // Now check if any user has no more booked seats and remove the bus
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

      // if (user.role === "admin") {
      //   const busData = await Bus.findOne(
      //     { _id: busId },
      //     { "seats.reservedSeats": 1 } // Fetch reservedSeats only
      //   );

      //   if (!busData) {
      //     return res.status(404).json({ message: "Bus not found" });
      //   }

      //   // Extract user IDs of affected users
      //   const reservedUserIds = busData.seats.reservedSeats
      //     .filter((seat) => seatStrings.includes(seat.seatNumber))
      //     .map((seat) => seat.reservedBy); // Extract reservedBy (user ID)

      //   // const BookedUserIds = busData.seats.bookedSeats
      //   //   .filter((index) => seatStrings.includes(String(index)))
      //   //   .map((seat) => seat !== "0"); // Extract reservedBy (user ID)

      //   console.log(reservedUserIds); // Array of user IDs

      //   // Remove the selected seat numbers from each user's bookedBuses.seats
      //   await User.updateMany(
      //     { _id: { $in: reservedUserIds } },
      //     { $pull: { "bookedBuses.seats": { $in: selectedSeats } } }
      //   );

      //   // Now check if any user has no more booked seats and remove the bus
      //   const usersToRemoveBus = await User.find({
      //     _id: { $in: reservedUserIds },
      //     "bookedBuses.seats": { $size: 0 }, // Users with no remaining booked seats
      //   });

      //   const usersToRemoveIds = usersToRemoveBus.map((u) => u._id);

      //   if (usersToRemoveIds.length > 0) {
      //     await User.updateMany(
      //       { _id: { $in: usersToRemoveIds } },
      //       { $pull: { "bookedBuses.buses": busId } }
      //     );
      //   }

      //   return res.json({
      //     reservedUserIds,
      //     message: "Users updated successfully",
      //     updatedBus,
      //   });
      // }
      // const busSeats = bus.seats.bookedSeats;
      // const userHasBookedSeats = busSeats.some((seat) => seat === userId);
      // Check if the user still has any booked seats on this bus

      // const busSeats = updatedBus.seats.bookedSeats;

      // // Check if any seat is still booked by the user
      // const userHasOtherBookedSeats = busSeats.some(
      //   (seat) => seat === userId // Check if the user's ID exists in any booked seat
      // );

      // const userHasBookedSeats = user.bookedBuses.seats.length > 0;

      // // If no seats are booked by the user, remove the bus from the user's booked buses
      // if (!userHasOtherBookedSeats && !userHasBookedSeats) {
      //   await User.findByIdAndUpdate(userId, {
      //     $pull: { "bookedBuses.buses": busId },
      //   });
      // } else {
      //   User.findOneAndUpdate(
      //     { _id: userId },
      //     { $pull: { "bookedBuses.seats": { $in: selectedSeats } } },
      //     { new: true } // Returns updated user data
      //   )
      //     .then((updatedUser) => {
      //       if (!updatedUser) {
      //         throw new Error("User not found");
      //       }
      //       const userHasBookedSeats = updatedUser.bookedBuses.seats.length > 0;
      //       if (!userHasBookedSeats) {
      //         return User.findOneAndUpdate(
      //           { _id: userId },
      //           { $pull: { "bookedBuses.buses": busId } }, // Remove the bus if no seats left
      //           { new: true }
      //         );
      //       }
      //     })
      //     .catch((error) => {
      //       console.error("Error updating user: ", error);
      //     });
      // }

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
