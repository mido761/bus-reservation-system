const express = require("express");
const router = express.Router();
const Bus = require("../models/busForm");
// const Bus = require("../models/busModel");
const Seat = require("../models/seat")
const User = require("../models/user");
const innerAuth = require("../controllers/Inner Authorization");

router.get("/:id", async (req, res) => {
    try {
        const busId = req.params.id;
        const bus = await Bus.findById(busId);
        if (!bus){
            return res.status(404).json({ message: "Bus not found" });
        }

        const seats = await Seat.find({busId: busId}, {bookedBy:1,route:1,bookedTime:1,checkInStatus:1});
        // console.log(seats)

        res.status(200).json({ message: "Current seats:", data: seats }); // ✅
    }catch (err) {
        console.error("Error fetching seats:", err);
        res
          .status(500)
          .json({ message: "Error fetching seats", error: err.message });
      }
})


router.post("/user", async (req, res) => {
  try {
    const { userList } = req.body;
    // console.log(userList)

    // 1. Validate input
    if (!Array.isArray(userList)) {
      return res.status(400).json({ message: "userList must be an array" });
    }

    // 2. Get unique user IDs (avoid duplicate fetch)
    const uniqueUserIds = [...new Set(userList)];

    // 3. Fetch users from DB
    const users = await User.find({ _id: { $in: uniqueUserIds } });

    // 4. Map user ID to user object
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });

    // 5. Reconstruct list to match original order (with duplicates)
    const orderedUsers = userList.map(id => userMap.get(id.toString()));

    // 6. Return ordered users
    res.status(200).json({ message: "Users found", data: orderedUsers });

  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});



router.get("/passenger/:id", async (req, res) => {
    try {
        const busId = req.params.id;
        const {userId} = req.body;
        const bus = await Bus.findById(busId);
        if (!bus){
            return res.status(404).json({ message: "Bus not found" });
        }

        const seats = await Seat.find({busId: busId}, {bookedBy:1,route : 1});
        let userSeat = [];
        for (let i = 0; i < seats.length ; i++ ){
            if (seats[i].bookedBy == userId){
                userSeat.push([i+1,seats[i].route]);
            }             
        }
        console.log(seats)
        const seatsNum = seats.length
        res.status(200).json({ message: "Current seats:", data: { seatsNum , userSeat} }); // ✅
    }catch (err) {
        console.error("Error fetching seats:", err);
        res
          .status(500)
          .json({ message: "Error fetching seats", error: err.message });
      }

})



module.exports = router;
