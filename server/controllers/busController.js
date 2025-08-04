// const Bus = require('../models/busModel');
// const busForm = require("../models/busForm");
// const User = require("../models/user");
// const Seat = require("../models/seat");
// const blackList = require("../models/blackList");
// const BookingHistory = require("../models/bookingHistory");
// const middleware = require("../controllers/middleware");
// const mongoose = require("mongoose");

// // Add New Bus (Seat-Based)
// const addNewBus = async (req, res) => {
//   try {
//     const {
//       totalSeats,
//       busNumber,
//       schedule,
//       minNoPassengers,
//       price,
//       pickupLocation,
//       arrivalLocation,
//       departureTime,
//       arrivalTime,
//       cancelTimeAllowance,
//       bookingTimeAllowance,
//       allowedNumberOfBags,
//     } = req.body;


//     // Check if all required fields are provided
//     if (
//       !schedule ||
//       !price ||
//       !busNumber ||
//       !pickupLocation ||
//       !arrivalLocation ||
//       !departureTime ||
//       !arrivalTime
//     ) {
//       return res.status(400).json({
//         message: "Missing required fields",
//       });
//     }
 
//     const newBus = new Bus({
//       seats: {
//         totalSeats: 20,
//         availableSeats: totalSeats,
//         // bookedSeats: new Array(totalSeats).fill(0)
//         bookedSeats: Array.from({ length: 20 }, () => 0),
//         genders: Array.from({ length: 20 }, () => 0),
//       },
//       schedule: schedule,
//       price: price,
//       minNoPassengers: minNoPassengers,
//       location: {
//         pickupLocation: pickupLocation,
//         arrivalLocation: arrivalLocation,
//       },
//       time: {
//         departureTime: departureTime,
//         arrivalTime: arrivalTime,
//       },
//       allowance: {
//         cancelTimeAllowance: cancelTimeAllowance,
//         bookingTimeAllowance: bookingTimeAllowance,
//       },
//       busNumber: busNumber,
//       allowedNumberOfBags: allowedNumberOfBags,
//     });

//     await newBus.save();
//     res.status(201).json("New Bus Created and saved successfully");
//   } catch (err) {
//     res
//       .status(400)
//       .json({ message: "Error adding the bus details", error: err.message });
//   }
// };


// // Add New Bus or schedule (Place only - not seats)
// const addNewForm = async (req, res) => {
//   try {
//     const {
//       schedule,
//       price,
//       pickupLocation,
//       arrivalLocation,
//       departureTime,
//       cancelTimeAllowance,
//       bookingTimeAllowance,
//     } = req.body;


//     // Check if all required fields are provided
//     if (
//       !schedule ||
//       !price ||
//       !pickupLocation ||
//       !arrivalLocation ||
//       !departureTime
//     ) {
//       return res.status(400).json({
//         message: "Missing required fields",
//       });
//     }
//     const newBusForm = new busForm({
//       schedule: schedule,
//       price: price,
//       location: {
//         pickupLocation: pickupLocation,
//         arrivalLocation: arrivalLocation,
//       },
//       departureTime: departureTime,
//       allowance: {
//         cancelTimeAllowance: cancelTimeAllowance * 60 * 60 * 1000,
//         bookingTimeAllowance: bookingTimeAllowance * 60 * 60 * 1000,
//       },
//     });

//     await newBusForm.save();
//     res.status(201).json("New Bus Created and saved successfully");
//   } catch (err) {
//     res
//       .status(400)
//       .json({ message: "Error adding the bus details", error: err.message });
//   }
// };




// module.exports = {addNewBus, addNewForm};