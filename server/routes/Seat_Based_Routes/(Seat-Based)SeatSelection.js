/**
 * @file SeatSelection.js
 * @description Advanced seat booking and reservation management with real-time updates
 * @module SeatSelectionRoutes
 */

const express = require("express");
const router = express.Router();
const Bus = require("../../models/busModel");
const User = require("../../models/user");
const Pusher = require("pusher");
const innerAuth = require("../../controllers/Inner Authorization");

/**
 * @const {Pusher}
 * @description Pusher configuration for real-time updates
 */
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

/**
 * @route GET /seatselection/:id
 * @description Get bus details for seat selection
 * @access Public
 * @param {string} req.params.id - Bus ID
 * @returns {Object} Bus details
 * @throws {404} If bus not found
 * @throws {500} For server errors
 */
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

/**
 * @route POST /seatselection/:busId
 * @description Book seats with validation and real-time updates
 * @access Public
 * @param {string} req.params.busId - Bus ID
 * @param {Object} req.body
 * @param {string} req.body.selectedSeats - Comma-separated seat numbers
 * @param {string} req.body.userId - User booking the seats
 * @returns {Object} Booking confirmation
 * @throws {404} If bus/user not found
 * @throws {400} If booking violates rules
 * @throws {500} For server errors
 */
router.post("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { selectedSeats, userId } = req.body;
  const seats = selectedSeats.split(",").map(Number);

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
    const seatQuery = {
      _id: busId,
      $and: seats.map((seat) => ({ [`seats.bookedSeats.${seat}`]: 0 })), // Ensure seats are free
    };

    // Merge seat assignment and gender update
    const seatUpdate = {
      $set: {
        ...Object.fromEntries(
          seats.map((seat) => [`seats.bookedSeats.${seat}`, userId])
        ),
        ...Object.fromEntries(
          seats.map((seat) => [`seats.genders.${seat}`, user.gender])
        ),
      },
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
      genders: updatedBus.seats.genders,
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
        $push: {
          bookedTime: { $each: seats.map(() => new Date()) } // Assign current time for each seat
        }
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

/**
 * @route POST /seatselection/reserve/:busId
 * @description Temporarily reserve seats before payment
 * @access Public
 * @param {string} req.params.busId - Bus ID
 * @param {Object} req.body.data
 * @param {Array<string>} req.body.data.selectedSeats - Seats to reserve
 * @param {string} req.body.data.userId - User reserving seats
 * @returns {Object} Reservation status
 * @throws {400} If reservation violates rules
 * @throws {404} If user not found
 * @throws {500} For server errors
 */
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

/**
 * @route DELETE /seatselection/:busId
 * @description Cancel seat bookings with cascading updates
 * @access Public
 * @param {string} req.params.busId - Bus ID
 * @param {Object} req.body
 * @param {Array<string>} req.body.selectedSeats - Seats to cancel
 * @param {string} req.body.userId - User canceling seats
 * @returns {Object} Cancellation confirmation
 * @throws {404} If bus/user/seat not found
 * @throws {400} If cancellation violates rules
 * @throws {500} For server errors
 */
router.delete("/:busId", async (req, res) => {
  const busId = req.params.busId;
  const { selectedSeats, userId } = req.body;

  const seatStrings = selectedSeats.map(String);
  console.log("Test cancel")


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
      acc[`seats.bookedSeats.${seat}`] = "0"; // Unbook the seat
      acc[`seats.genders.${seat}`] = "0"; // Reset gender to "0"
      return acc;
    }, {});

    const BookedUserIds = [
      ...new Set(
        selectedSeats
          .map((i) => bus.seats.bookedSeats[i])
          .filter((seat) => seat !== "0")
      ),
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
      const seatIndexes = selectedSeats
        .map(seat => user.bookedBuses.seats.indexOf(seat))
        .filter(index => index !== -1);

      await User.updateMany(
        { _id: { $in: BookedUserIds } },
        {
          $pull: { "bookedBuses.seats": { $in: selectedSeats } }
        }
      );

      // Step 1: Unset specific indexes in bookedTime
      const unsetFields = seatIndexes.reduce((acc, index) => {
        acc[`bookedTime.${index}`] = 1;
        return acc;
      }, {});

      await User.updateMany(
        { _id: { $in: BookedUserIds } },
        { $unset: unsetFields }
      );

      // Step 2: Remove null values from bookedTime
      await User.updateMany(
        { _id: { $in: BookedUserIds } },
        { $pull: { bookedTime: null } }
      );



      await User.updateOne(
        { _id: userId },
        { $pull: { bookedTime: null } }
      );

      // Now check if any user has no more booked seats and remove the bus
      const usersToRemoveBus = await User.find({
        _id: { $in: BookedUserIds },
        "bookedBuses.seats": { $size: 0 }, // Users with no remaining booked seats
      });

      // // Step 1: Fetch users who booked the selected seats
      // const bookedUsers = await User.find({ _id: { $in: BookedUserIds } });

      // // Step 2: Map selected seats to their indexes and extract booked times
      // const userUpdates = bookedUsers.map(user => {
      //   // Get the indexes of the selected seats in bookedBuses.seats
      //   const seatIndexes = selectedSeats
      //     .map(seat => user.bookedBuses.seats.indexOf(seat)) // Get indexes
      //     .filter(index => index !== -1); // Remove invalid indexes

      //   // Get the corresponding bookedTime values
      //   const bookedTimesToRemove = seatIndexes.map(index => user.bookedTime[index]);

      //   return { userId: user._id, bookedTimesToRemove };
      // });

      // // Step 3: Update each user to remove the correct bookedTime values
      // await Promise.all(userUpdates.map(({ userId, bookedTimesToRemove }) =>
      //   User.updateOne(
      //     { _id: userId },
      //     { $pullAll: { bookedTime: bookedTimesToRemove } }
      //   )
      // ));


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
