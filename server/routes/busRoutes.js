const express = require("express");
const Bus = require("../models/busModel");
const busForm = require("../models/busForm");
const User = require("../models/user");
const Seat = require("../models/seat");
const blackList = require("../models/blackList");
const BookingHistory = require("../models/bookingHistory");
const router = express.Router();
const middleware = require("../controllers/middleware");
const mongoose = require("mongoose");

/**
 * @route POST /buses
 * @description Create a new bus with specified details
 * @access Private - Admin only
 * @param {Object} req.body
 * @param {number} req.body.totalSeats - Total number of seats in the bus
 * @param {number} req.body.busNumber - Unique identifier for the bus
 * @param {string} req.body.schedule - Bus schedule/frequency
 * @param {number} req.body.minNoPassengers - Minimum number of passengers required
 * @param {number} req.body.price - Ticket price
 * @param {string} req.body.pickupLocation - Starting point
 * @param {string} req.body.arrivalLocation - Destination
 * @param {string} req.body.departureTime - Time of departure
 * @param {string} req.body.arrivalTime - Expected arrival time
 * @param {number} req.body.cancelTimeAllowance - Time limit for cancellation
 * @param {number} req.body.bookingTimeAllowance - Time limit for booking
 * @param {number} req.body.allowedNumberOfBags - Maximum bags per passenger
 * @returns {Object} Message indicating success or failure
 */
router.post("/", middleware.isAuthoraized, async (req, res) => {
  try {
    const {
      totalSeats,
      busNumber,
      schedule,
      minNoPassengers,
      price,
      pickupLocation,
      arrivalLocation,
      departureTime,
      arrivalTime,
      cancelTimeAllowance,
      bookingTimeAllowance,
      allowedNumberOfBags,
    } = req.body;

    console.log(req.body);

    // Check if all required fields are provided
    if (
      !schedule ||
      !price ||
      !busNumber ||
      !pickupLocation ||
      !arrivalLocation ||
      !departureTime ||
      !arrivalTime
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    // console.log('Total Seats:', totalSeats);
    // console.log('Schedule:', schedule);
    // console.log('Min No. Passengers:', minNoPassengers);
    // console.log('Price:', price);
    // console.log('Pickup Location:', pickupLocation);
    // console.log('Arrival Location:', arrivalLocation);
    // console.log('Departure Time:', departureTime);
    // console.log('Arrival Time:', arrivalTime);
    // console.log('Cancel Time Allowance:', cancelTimeAllowance);
    // console.log('Booking Time Allowance:', bookingTimeAllowance);
    // console.log('Allowed Number of Bags:', allowedNumberOfBags);

    const newBus = new Bus({
      seats: {
        totalSeats: 20,
        availableSeats: totalSeats,
        // bookedSeats: new Array(totalSeats).fill(0)
        bookedSeats: Array.from({ length: 20 }, () => 0),
        genders: Array.from({ length: 20 }, () => 0),
      },
      schedule: schedule,
      price: price,
      minNoPassengers: minNoPassengers,
      location: {
        pickupLocation: pickupLocation,
        arrivalLocation: arrivalLocation,
      },
      time: {
        departureTime: departureTime,
        arrivalTime: arrivalTime,
      },
      allowance: {
        cancelTimeAllowance: cancelTimeAllowance,
        bookingTimeAllowance: bookingTimeAllowance,
      },
      busNumber: busNumber,
      allowedNumberOfBags: allowedNumberOfBags,
    });
    // console.log(newBus);
    await newBus.save();
    res.status(201).json("New Bus Created and saved successfully");
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding the bus details", error: err.message });
  }
});

/**
 * @route POST /buses/formbuses
 * @description Create a new bus form template
 * @access Private - Admin only
 * @param {Object} req.body
 * @param {string} req.body.schedule - Bus schedule
 * @param {number} req.body.price - Ticket price
 * @param {string} req.body.pickupLocation - Starting point
 * @param {string} req.body.arrivalLocation - Destination
 * @param {string} req.body.departureTime - Time of departure
 * @param {number} req.body.cancelTimeAllowance - Cancellation time limit
 * @param {number} req.body.bookingTimeAllowance - Booking time limit
 * @returns {Object} Message indicating success or failure
 */
router.post("/formbuses", middleware.isAuthoraized, async (req, res) => {
  try {
    const {
      schedule,
      price,
      pickupLocation,
      arrivalLocation,
      departureTime,
      cancelTimeAllowance,
      bookingTimeAllowance,
    } = req.body;

    console.log(req.body);

    // Check if all required fields are provided
    if (
      !schedule ||
      !price ||
      !pickupLocation ||
      !arrivalLocation ||
      !departureTime
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    const newBusForm = new busForm({
      schedule: schedule,
      price: price,
      location: {
        pickupLocation: pickupLocation,
        arrivalLocation: arrivalLocation,
      },
      departureTime: departureTime,
      allowance: {
        cancelTimeAllowance: cancelTimeAllowance,
        bookingTimeAllowance: bookingTimeAllowance,
      },
    });
    // console.log(newBus);
    await newBusForm.save();
    res.status(201).json("New Bus Created and saved successfully");
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding the bus details", error: err.message });
  }
});

// // Search for a user in the bus list
// router.get("/searchUser", async (req, res) => {
//   try {
//     const { username } = req.query;

//     if (!username) {
//       return res.status(400).json({ message: "Username is required" });
//     }

//     // Find buses where the username is in the bookedUsers list
//     const buses = await Bus.find({
//       "seats.bookedUsers": { $elemMatch: { name: username } },
//     });

//     if (buses.length === 0) {
//       return res.status(404).json({ message: "User not found in any bus" });
//     }

//     res.status(200).json(buses);
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// });

/**
 * @route GET /buses
 * @description Get all bus form templates
 * @access Public
 * @returns {Array<Object>} Array of bus form templates
 */
router.get("/", async (req, res) => {
  try {
    const buses = await busForm.find();
    res.status(200).json(buses);
  } catch (err) {
    res.status(400).json({ message: "Error fetching busses", error: err });
  }
});

/**
 * @route GET /buses/userBuses
 * @description Get multiple buses by their IDs
 * @access Private - Authenticated users only
 * @param {string} req.query.ids - Comma-separated list of bus IDs
 * @returns {Array<Object>} Array of bus details
 */
router.get("/userBuses", middleware.isAuthenticated, async (req, res) => {
  const { ids } = req.query; // Expecting ids as comma-separated values

  if (ids) {
    const busDetails = await Bus.find({ _id: { $in: ids.split(",") } });
    return res.json(busDetails);
  }
  return res.json((busDetails = []));
});

/**
 * @route GET /buses/:id
 * @description Get a specific bus form template by ID
 * @access Private - Authenticated users only
 * @param {string} req.params.id - Bus ID
 * @returns {Object} Bus form template details
 */
router.get("/:id", middleware.isAuthenticated, async (req, res) => {
  try {
    const response = await busForm.findById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /buses/:id
 * @description Delete a bus and update related user records
 * @access Private - Admin only
 * @param {string} req.params.id - Bus ID to delete
 * @returns {Object} Message indicating success or failure
 */
router.delete("/:id", middleware.isAuthoraized, async (req, res) => {
  try {
    const id = req.params.id;
    const busDetails = await Bus.findById(id);
    await User.updateMany(
      {
        _id: {
          $in: busDetails.seats.bookedSeats.filter(
            mongoose.Types.ObjectId.isValid
          ),
        },
      },
      {
        $set: {
          "bookedBuses.buses": [],
          "bookedBuses.seats": [],
          checkInStatus: false,
        },
        $unset: { bookedTime: "" },
      }
    );
    const deletedBus = await Bus.deleteOne({ _id: id });

    if (!id) {
      return res.status(404).json({ error: "Bus not found" });
    }

    res
      .status(200)
      .json({ message: "Bus deleted successfully", bus: deletedBus });
  } catch (err) {
    console.error("Error deleting the Item", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/busForm/:id", middleware.isAuthoraized, async (req, res) => {
  try {
    const busId = req.params.id;

    if(!busId) { return res.status(404).json({ error: "Bus not found" })}
    
    const seats = await Seat.deleteMany({busId: busId}) 
    const updateBookingHistory = await BookingHistory.updateMany({busId:busId,bookingStatus:"booked"},{bookingStatus:"completed"})

    if(!seats){ return res.status(400).json({error: "Error deleting seats!"})}
    if(!updateBookingHistory.acknowledged){ return res.status(400).json({error: "Error Updateing Booking History!"})}

    const deletedBus = await busForm.deleteOne({ _id: busId });

    if (!busId) {
      return res.status(404).json({ error: "Bus not found" });
    }

    return res
      .status(200)
      .json({ message: "Bus deleted successfully"});
  } catch (err) {
    console.error("Error deleting the Item", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a bus
router.put("/edit-bus/:busId", middleware.isAuthoraized,async (req, res) => {
  const busId = req.params.busId;
  console.log(req.body);
  try {
    const updatedBus = await busForm.findByIdAndUpdate(
      busId,
      {
        $set: {
          "location.pickupLocation": req.body.location?.pickupLocation,
          "location.arrivalLocation": req.body.location?.arrivalLocation,
          departureTime: req.body.time?.departureTime,
          // "time.arrivalTime": req.body.time?.arrivalTime,
          schedule: req.body.schedule,
          price: req.body.price,
          // busNumber: req.body.busNumber,
          pickupLocation: req.body.pickupLocation,
          arrivalLocation: req.body.arrivalLocation,
          departureTime: req.body.departureTime,
          // arrivalTime: req.body.arrivalTime,
        },
      },
      { new: true }
    );
    if (!updatedBus) return res.status(404).json({ message: "Bus not found" });
    res.json({ message: "Bus updated successfully", bus: updatedBus });
  } catch (err) {
    res.status(400).json({ message: "Failed to update bus" });
  }
});

module.exports = router;
