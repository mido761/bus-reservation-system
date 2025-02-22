const express = require("express");
const Bus = require("../models/busModel");
const User = require("../models/user");
const router = express.Router();
const middleware = require("../controllers/middleware");
const mongoose = require("mongoose");

// Add new Bus details
router.post("/", middleware.isAuthoraized, async (req, res) => {
  try {
    const {
      totalSeats,
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
        totalSeats: 15,
        availableSeats: totalSeats,
        // bookedSeats: new Array(totalSeats).fill(0)
        bookedSeats: Array.from({ length: 15 }, () => 0),
      },
      schedule: schedule,
      price: price,
      minNoPassengers: minNoPassengers,
      location: {
        pickupLocation: pickupLocation,
        arrivalLocation: arrivalLocation,
      },
      time: { departureTime: departureTime, arrivalTime: arrivalTime },
      allowance: {
        cancelTimeAllowance: cancelTimeAllowance,
        bookingTimeAllowance: bookingTimeAllowance,
      },
      allowedNumberOfBags: allowedNumberOfBags,
    });
    // console.log(newBus);
    await newBus.save();
    console.log(newBus);
    res.status(201).json("New Bus Created and saved successfully");
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding the bus details", error: err.message });
  }
});

// Get all buses
router.get("/", async (req, res) => {
  try {
    const buses = await Bus.find();
    res.status(200).json(buses);
  } catch (err) {
    res.status(400).json({ message: "Error fetching busses", error: err });
  }
});

// Fetch multiple buses at once
router.get("/userBuses", async (req, res) => {
  const { ids } = req.query; // Expecting ids as comma-separated values
  // console.log("IDs: ", ids)
  // return res.json(ids)
  if (ids) {
    const busDetails = await Bus.find({ _id: { $in: ids.split(",") } });
    return res.json(busDetails);
  }
  return res.json(busDetails = []);
});

router.get("/:id", async (req, res) => {
  try {
    const response = await Bus.findById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
      { $set: { "bookedBuses.buses": [], "bookedBuses.seats": [] } }
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

module.exports = router;
