      if (user.role === "admin") {
        const busData = await Bus.findOne(
          { _id: busId },
          { "seats.reservedSeats": 1 } // Fetch reservedSeats only
        );

        if (!busData) {
          return res.status(404).json({ message: "Bus not found" });
        }

        // Extract user IDs of affected users
        const reservedUserIds = busData.seats.reservedSeats
          .filter((seat) => seatStrings.includes(seat.seatNumber))
          .map((seat) => seat.reservedBy); // Extract reservedBy (user ID)

        // const BookedUserIds = busData.seats.bookedSeats
        //   .filter((index) => seatStrings.includes(String(index)))
        //   .map((seat) => seat !== "0"); // Extract reservedBy (user ID)

        console.log(reservedUserIds); // Array of user IDs

        // // Remove the selected seat numbers from each user's bookedBuses.seats
        // await User.updateMany(
        //   { _id: { $in: reservedUserIds } },
        //   { $pull: { "bookedBuses.seats": { $in: selectedSeats } } }
        // );

        // // Now check if any user has no more booked seats and remove the bus
        // const usersToRemoveBus = await User.find({
        //   _id: { $in: reservedUserIds },
        //   "bookedBuses.seats": { $size: 0 }, // Users with no remaining booked seats
        // });

        // const usersToRemoveIds = usersToRemoveBus.map((u) => u._id);

        // if (usersToRemoveIds.length > 0) {
        //   await User.updateMany(
        //     { _id: { $in: usersToRemoveIds } },
        //     { $pull: { "bookedBuses.buses": busId } }
        //   );
        // }

        return res.json({
          reservedUserIds,
          message: "Users updated successfully",
          updatedBus,
        });
      }