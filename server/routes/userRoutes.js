const express = require("express");
const User = require("../models/user");
const router = express.Router();
const Bus = require("../models/busModel");
const BusForm = require("../models/busForm");
// const Bus = require("../models/busModel");
const Seat = require("../models/seat");
const middleware = require("../controllers/middleware");
const { default: mongoose } = require("mongoose");
const { route } = require("./busRoutes");

/**
 * @route GET /user
 * @description Get all users in the system
 * @access Private - Admin only
 * @returns {Array<Object>} Array of user objects
 */
router.get("/", middleware.isAuthoraized, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /user/profile/:userId
 * @description Get a specific user's profile
 * @access Public
 * @param {string} req.params.userId - User ID to fetch
 * @returns {Object} User profile details
 */
router.get("/profile/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /user/profiles
 * @description Get multiple user profiles by their IDs
 * @access Public
 * @param {Object} req.body
 * @param {string[]} req.body.userIds - Array of user IDs to fetch
 * @returns {Array<Object>} Array of user profiles with selected fields
 */
router.post("/profiles", async (req, res) => {
  const { userIds } = req.body;
  const users = await User.find(
    { _id: { $in: userIds } },
    "name phoneNumber bookedBuses.seats checkInStatus bookedTime"
  ); // Fetch all users at once
  res.json(users);
});

/**
 * @route POST /user/profilesNames
 * @description Get names of multiple users by their IDs
 * @access Public
 * @param {Object} req.body
 * @param {string[]} req.body.userIds - Array of user IDs to fetch
 * @returns {Array<Object>} Array of user names
 */
router.post("/profilesNames", async (req, res) => {
  const { userIds } = req.body;
  const users = await User.find({ _id: { $in: userIds } }, "name"); // Fetch all users at once
  res.json(users);
});

/**
 * @route GET /user/bus/:id
 * @description Get all buses booked by a specific user (seat-based)
 * @access Public
 * @param {string} req.params.id - User ID
 * @returns {Array<Object>} Array of bus details
 */
router.get("/bus/:id", async (req, res) => {
  try {
    const users = await User.find({ _id: req.params.id });
    // res.json(users);
    // res.json(users.map(user => user.bookedBuses.BusId));
    const busIds = users.map((user) => user.bookedBuses.BusId);
    // const objIds = [busIds.map(id => new mongoose.Types.ObjectId(id))];
    const avBuses = await Bus.find({ _id: { $in: busIds } });
    res.json(avBuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /user/form-based-bus/:id
 * @description Get all buses booked by a specific user (form-based)
 * @access Public
 * @param {string} req.params.id - User ID
 * @returns {Array<Object>} Array of bus form details
 */
router.get("/form-based-bus/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({message: "Not a valid user ID!"})
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
    const busesObjects = await BusForm.find({_id: {$in: uniqueBusesArr.map(id => new mongoose.Types.ObjectId(id))}}) // get the busDetails for each user

    return res.status(200).json(busesObjects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /user/bus/:id
 * @description Delete a user and their bookings
 * @access Public
 * @param {string} req.params.id - User ID to delete
 * @returns {Object} Success/failure message
 */
router.delete("/bus/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /user/check-in/:userId
 * @description Mark a user as checked in
 * @access Public
 * @param {string} req.params.userId - User ID to check in
 * @returns {Object} Updated user object and success message
 */
router.put("/check-in/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.checkInStatus = true; // Mark user as checked in
    await user.save();

    res.json({ message: "User checked in successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /user/check-out/:userId
 * @description Mark a user as checked out
 * @access Public
 * @param {string} req.params.userId - User ID to check out
 * @returns {Object} Updated user object and success message
 */
router.put("/check-out/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.checkInStatus = false; // Mark user as checked in
    await user.save();

    res.json({ message: "User checked in successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /user/edit-gender/:userId
 * @description Update a user's gender
 * @access Public
 * @param {string} req.params.userId - User ID to update
 * @param {Object} req.body
 * @param {string} req.body.gender - New gender value
 * @returns {Object} Updated user object and success message
 */
router.put("/edit-gender/:userId", async (req, res) => {
  try {
    const { gender } = req.body; // ✅ Extract gender
    console.log(gender);

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
});

module.exports = router;
