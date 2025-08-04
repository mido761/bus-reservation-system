const busForm = require("../models/busForm");
const User = require("../models/user");
const Seat = require("../models/seat");
const blackList = require("../models/blackList");
const BookingHistory = require("../models/bookingHistory");
const middleware = require("../controllers/middleware");
const mongoose = require("mongoose");

// get all Forms
const getForms = async (req, res) => {
  try {
    const buses = await busForm.find();
    res.status(200).json(buses);
  } catch (err) {
    res.status(400).json({ message: "Error fetching busses", error: err });
  }
};

// get Form By ID
const getFormByID = async (req, res) => {
  try {
    const response = await busForm.findById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add New Bus or schedule (Place only - not seats)
const addNewForm = async (req, res) => {
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
        cancelTimeAllowance: cancelTimeAllowance * 60 * 60 * 1000,
        bookingTimeAllowance: bookingTimeAllowance * 60 * 60 * 1000,
      },
    });

    await newBusForm.save();
    res.status(201).json("New Bus Created and saved successfully");
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error adding the bus details", error: err.message });
  }
};


// Updating form details
const updateForm = async (req, res) => {
  const busId = req.params.busId;

  try {
    const updatedBus = await busForm.findByIdAndUpdate(
      busId,
      {
        $set: {
          "location.pickupLocation": req.body.location?.pickupLocation,
          "location.arrivalLocation": req.body.location?.arrivalLocation,
          departureTime: req.body.time?.departureTime,
          schedule: req.body.schedule,
          price: req.body.price,
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
};


// Deleting Form
const deleteForm = async (req, res) => {
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
      .json({ message: "Bus deleted successfully" });
  } catch (err) {
    console.error("Error deleting the Item", err);
    res.status(500).json({ error: "Internal server error" });
  }
}



module.exports = { getForms, getFormByID, addNewForm, updateForm, deleteForm};
