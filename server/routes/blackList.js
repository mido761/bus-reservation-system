const express = require("express");
const Bus = require("../models/busModel");
const busForm = require("../models/busForm");
const User = require("../models/user");
const Seat = require("../models/seat");
const blackList = require("../models/blackList");
const router = express.Router();
const middleware = require("../controllers/middleware");
const mongoose = require("mongoose");

/**
 * @route POST /blacklist/:busId
 * @description Add all users who haven't checked in for a specific bus to the blacklist
 * @access Private - Admin only
 * @param {string} req.params.busId - ID of the bus to check
 * @returns {Object} Success message and array of blacklisted users
 * @throws {404} If bus not found
 * @throws {500} For internal server errors
 */
router.post("/:busId", middleware.isAuthoraized, async (req, res) => {
  try {  
    const busId = req.params.busId;
    
    if (!busId) { 
      return res.status(404).json({ error: "Bus not found" });
    }

    const uniqueUsers = await Seat.distinct("bookedBy", {
      busId: busId,
      checkInStatus: false
    });

    // Step 2: Map to documents for insertion
    const usersToBlacklist = uniqueUsers.map(userId => ({
      userId,
      reason: "Not checked in",
    }));
    
    const AddToBlackList = await blackList.insertMany(usersToBlacklist, { ordered: false }); 
    
    return res
      .status(200)
      .json({ message: "Users added to blacklist successfully", blackListedUsers: AddToBlackList });
  } catch (err) {
    console.error("Error adding users to blacklist", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route POST /blacklist/user/:seatId
 * @description Add a specific user to the blacklist based on their seat
 * @access Private - Admin only
 * @param {string} req.params.seatId - ID of the seat to check
 * @returns {Object} Success message and blacklisted user details
 * @throws {404} If seat not found
 * @throws {400} If user is already blacklisted
 * @throws {500} For internal server errors
 */
router.post("/user/:seatId", middleware.isAuthoraized, async (req, res) => {
  try {  
    const seatId = req.params.seatId;
    
    if (!seatId) { 
      return res.status(404).json({ error: "Seat not found" });
    }

    const seat = await Seat.findById(seatId);
    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    const inblacklist = await blackList.find({ userId: seat.bookedBy });
    if (inblacklist.length > 0) {
      return res.status(400).json({ message: "User is already in blacklist" });
    }

    // Step 2: Map to documents for insertion
    const AddToBlackList = new blackList({
      userId: seat.bookedBy,
      seatId: seat._id,
      reason: "Not checked in", 
    });
    
    await AddToBlackList.save();
    
    return res
      .status(200)
      .json({ message: "User added to blacklist successfully", blackListedUsers: AddToBlackList });
  } catch (err) {
    console.error("Error adding users to blacklist", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route GET /blacklist
 * @description Get all blacklisted users with their details
 * @access Public
 * @returns {Object} Object containing blacklist entries and user details
 * @property {Array<Object>} blacklist - Array of blacklist entries
 * @property {Array<Object>} userNameNum - Array of user details (name, phone)
 * @throws {500} For internal server errors
 */
router.get("/", async (req, res) => {
  try {
    const blacklist = await blackList.find();
    
    // Step 1: Get all user IDs from blacklist
    const userIds = blacklist.map(user => user.userId);
    
    // Step 2: Find all users whose _id is in the list
    const uniqueUsers = await User.find({ _id: { $in: userIds } });

    // Map by _id for fast lookup
    const userMap = {};
    uniqueUsers.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    // Rebuild list with user info in correct order
    const userNameNum = blacklist.map(item => {
      const user = userMap[item.userId.toString()];
      return user ? {
        _id: user._id, // Include _id for mapping in frontend
        name: user.name,
        phoneNumber: user.phoneNumber
      } : {
        _id: item.userId,
        name: "Unknown User",
        phoneNumber: "N/A"
      };
    });
       
    return res.status(200).json({ blacklist, userNameNum });
  } catch (err) {
    console.error("Error finding users in blacklist", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route DELETE /blacklist/:id
 * @description Remove a user from the blacklist
 * @access Public
 * @param {string} req.params.id - ID of the blacklist entry to remove
 * @returns {Object} Success message and removed blacklist entry
 * @throws {400} If ID format is invalid
 * @throws {404} If blacklist entry not found
 * @throws {500} For internal server errors
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blacklist ID format" });
    }
    
    const inblacklist = await blackList.findById(id);

    if (!inblacklist) {
      return res.status(404).json({ error: "User not found in blacklist" });
    }
    
    await blackList.findByIdAndDelete(id);
    
    // Include user info in response if needed
    const user = await User.findById(inblacklist.userId);
    const userName = user ? user.name : "Unknown User";
    
    return res.status(200).json({ 
      success: true, 
      message: `User ${userName} has been removed from blacklist successfully`,
      removedItem: inblacklist
    });
  } catch (err) {
    console.error("Error removing user from blacklist:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;