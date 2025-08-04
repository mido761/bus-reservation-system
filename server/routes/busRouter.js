// const express = require("express");
// const {addNewBus, addNewForm} = require("../controllers/busController");

// const router = express.Router();


// /** (Seat-Based)
//  * @route POST /buses
//  * @description Create a new bus with specified details 
//  * @access Private - Admin only
//  * @param {Object} req.body
//  * @param {number} req.body.totalSeats - Total number of seats in the bus
//  * @param {number} req.body.busNumber - Unique identifier for the bus
//  * @param {string} req.body.schedule - Bus schedule/frequency
//  * @param {number} req.body.minNoPassengers - Minimum number of passengers required
//  * @param {number} req.body.price - Ticket price
//  * @param {string} req.body.pickupLocation - Starting point
//  * @param {string} req.body.arrivalLocation - Destination
//  * @param {string} req.body.departureTime - Time of departure
//  * @param {string} req.body.arrivalTime - Expected arrival time
//  * @param {number} req.body.cancelTimeAllowance - Time limit for cancellation
//  * @param {number} req.body.bookingTimeAllowance - Time limit for booking
//  * @param {number} req.body.allowedNumberOfBags - Maximum bags per passenger
//  * @returns {Object} Message indicating success or failure
//  */
// router.post("/", middleware.isAuthoraized, addNewBus)
// // router.post("/", middleware.isAuthoraized, async (req, res) => {
// //   try {
// //     const {
// //       totalSeats,
// //       busNumber,
// //       schedule,
// //       minNoPassengers,
// //       price,
// //       pickupLocation,
// //       arrivalLocation,
// //       departureTime,
// //       arrivalTime,
// //       cancelTimeAllowance,
// //       bookingTimeAllowance,
// //       allowedNumberOfBags,
// //     } = req.body;


// //     // Check if all required fields are provided
// //     if (
// //       !schedule ||
// //       !price ||
// //       !busNumber ||
// //       !pickupLocation ||
// //       !arrivalLocation ||
// //       !departureTime ||
// //       !arrivalTime
// //     ) {
// //       return res.status(400).json({
// //         message: "Missing required fields",
// //       });
// //     }
 
// //     const newBus = new Bus({
// //       seats: {
// //         totalSeats: 20,
// //         availableSeats: totalSeats,
// //         // bookedSeats: new Array(totalSeats).fill(0)
// //         bookedSeats: Array.from({ length: 20 }, () => 0),
// //         genders: Array.from({ length: 20 }, () => 0),
// //       },
// //       schedule: schedule,
// //       price: price,
// //       minNoPassengers: minNoPassengers,
// //       location: {
// //         pickupLocation: pickupLocation,
// //         arrivalLocation: arrivalLocation,
// //       },
// //       time: {
// //         departureTime: departureTime,
// //         arrivalTime: arrivalTime,
// //       },
// //       allowance: {
// //         cancelTimeAllowance: cancelTimeAllowance,
// //         bookingTimeAllowance: bookingTimeAllowance,
// //       },
// //       busNumber: busNumber,
// //       allowedNumberOfBags: allowedNumberOfBags,
// //     });

// //     await newBus.save();
// //     res.status(201).json("New Bus Created and saved successfully");
// //   } catch (err) {
// //     res
// //       .status(400)
// //       .json({ message: "Error adding the bus details", error: err.message });
// //   }
// // });



// /**
//  * @route GET /buses/userBuses
//  * @description Get multiple buses by their IDs
//  * @access Private - Authenticated users only
//  * @param {string} req.query.ids - Comma-separated list of bus IDs
//  * @returns {Array<Object>} Array of bus details
//  */
// router.get("/userBuses", middleware.isAuthenticated, async (req, res) => {
//   const { ids } = req.query; // Expecting ids as comma-separated values

//   if (ids) {
//     const busDetails = await Bus.find({ _id: { $in: ids.split(",") } });
//     return res.json(busDetails);
//   }
//   return res.json((busDetails = []));
// });



// /**
//  * @route DELETE /buses/:id
//  * @description Delete a bus and update related user records
//  * @access Private - Admin only
//  * @param {string} req.params.id - Bus ID to delete
//  * @returns {Object} Message indicating success or failure
//  */
// router.delete("/:id", middleware.isAuthoraized, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const busDetails = await Bus.findById(id);
//     await User.updateMany(
//       {
//         _id: {
//           $in: busDetails.seats.bookedSeats.filter(
//             mongoose.Types.ObjectId.isValid
//           ),
//         },
//       },
//       {
//         $set: {
//           "bookedBuses.buses": [],
//           "bookedBuses.seats": [],
//           checkInStatus: false,
//         },
//         $unset: { bookedTime: "" },
//       }
//     );
//     const deletedBus = await Bus.deleteOne({ _id: id });

//     if (!id) {
//       return res.status(404).json({ error: "Bus not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "Bus deleted successfully", bus: deletedBus });
//   } catch (err) {
//     console.error("Error deleting the Item", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// module.exports = router;
