const User = require("../models/user");
const BusForm = require("../models/busForm");
const Seat = require("../models/seat");
const { default: mongoose } = require("mongoose");

// Get all users in the system
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific user's profile
const getUserInfo = async (req, res) => {
  const userId = req.params.userId;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json("Invalid ID format");
    }

    if (req.session.userId.toString() !== req.params.userId) {
      return res.status(403).json("Access denied");
    }

    const user = await User.findById(userId, {
      _id: 0,
      name: 1,
      email: 1,
      phoneNumber: 1,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get multiple user profiles by their IDs
const getProfileNames = async (req, res) => {
  const { userIds } = req.body;
  const users = await User.find({ _id: { $in: userIds } }, "name"); // Fetch all users at once
  res.json(users);
};

// Get all buses booked by a specific user (form-based)
const getUserForms = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Not a valid user ID!" });
    }
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const seats = await Seat.find({ bookedBy: userId }, { busId: 1 }); // get all seats for that user

    // make sure the user have seats
    if (seats.length === 0) {
      return res.status(404).json({ message: "No seats found for this user." });
    }

    const uniqueBusesArr = [
      ...new Set(seats.map((seat) => seat.busId.toString())),
    ]; // make an array of the user buses
    const busesObjects = await BusForm.find({
      _id: { $in: uniqueBusesArr.map((id) => new mongoose.Types.ObjectId(id)) },
    }); // get the busDetails for each user

    return res.status(200).json(busesObjects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a user's gender
const editGender = async (req, res) => {
  try {
    const { gender } = req.body; // ✅ Extract gender

    if (!gender) return res.status(400).json({ error: "Gender is required" });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.gender = gender; // ✅ Assign the correct value
    await user.save();

    res.json({ message: "Gender updated successfully", user });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserInfo,
  getProfileNames,
  getUserForms,
  editGender,
};
