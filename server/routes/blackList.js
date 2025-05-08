const express = require("express");
const Bus = require("../models/busModel");
const busForm = require("../models/busForm");
const User = require("../models/user");
const Seat = require("../models/seat");
const blackList = require("../models/blackList");
const router = express.Router();
const middleware = require("../controllers/middleware");
const mongoose = require("mongoose");

router.post("/:busId", middleware.isAuthoraized, async (req, res) => {
  try{  
    
    const busId = req.params.busId;
    
    if(!busId) { return res.status(404).json({ error: "Bus not found" })}
    const blackListedUsers = await Seat.find({ busId: busId,checkInStatus: false },{ bookedBy: 1,busId: 1 });
    
    const AddToBlackList = await blackList.insertMany(blackListedUsers.map((user) => ({ userId: user.bookedBy, busId: user.busId }))); 
    return res
    .status(200)
    .json({ message: "User added to blacklist successfully", blackListedUsers: AddToBlackList });
} catch (err) {
  console.error("Error adding users to blacklist", err);
  res.status(500).json({ error: "Internal server error" });
}
})

module.exports = router;