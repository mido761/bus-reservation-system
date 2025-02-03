const express = require("express");
const Bus = require("../models/busModel");
const router = express.Router();

// Add new Bus details
router.post("/", async (req, res) => {
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
    !totalSeats ||
    !schedule ||
    !minNoPassengers ||
    !price ||
    !pickupLocation ||
    !arrivalLocation ||
    !departureTime ||
    !arrivalTime ||
    !cancelTimeAllowance ||
    !bookingTimeAllowance ||
    !allowedNumberOfBags
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
      seats: { totalSeats: totalSeats,
         // bookedSeats: new Array(totalSeats).fill(0)
         bookedSeats: Array.from({ length: totalSeats }, () => 0)
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


router.get("/:id", async (req, res) => {
    try {
        const response = await Bus.findById(req.params.id);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
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
