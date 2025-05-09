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
})



router.post("/user/:seatId", middleware.isAuthoraized, async (req, res) => {
  try{  
    
    const seatId = req.params.seatId;
    
    if(!seatId) { return res.status(404).json({ error: "Bus not found" })}

    const seat = await Seat.findById(seatId)

    // Step 2: Map to documents for insertion
    const AddToBlackList = new blackList({
          userId:seat.bookedBy,
          seatId: seat._id,
          reason:"RsrvNotCome" 
        });
      await AddToBlackList.save()
    return res
    .status(200)
    .json({ message: "User added to blacklist successfully", blackListedUsers: AddToBlackList });
} catch (err) {
  console.error("Error adding users to blacklist", err);
  res.status(500).json({ error: "Internal server error" });
}
})

router.get("/",async (req, res) => {
  try{
    const blacklist = await blackList.find()
    // Step 1: Get all user IDs from blacklist
    const userIds = blacklist.map(user => user.userId);
    // Step 2: Find all users whose _id is in the list
    const usersInfo = await User.find({ _id: { $in: userIds } });
    // Step 3: Map to desired fields
    const userNameNum = usersInfo.map(user => ({
      name: user.name,
      phoneNumber: user.phoneNumber
    }));
       
    return res.status(200).json({ blacklist,userNameNum});
} catch (err) {
  console.error("Error finding users in blacklist", err);
  res.status(500).json({ error: "Internal server error" });
}
})

router.delete("/:id", async (req,res) => {
  const id = req.params.id;
  const inblacklist = await blackList.findById(id);

  if (!inblacklist) {
    return res.status(404).json({ message: "not found in Black list" });
  }
  await blackList.findByIdAndDelete(id);
})

module.exports = router;