import express from "express";
import authentication from "../middleware/authentication.js";
import { getAllUsers, getUserInfo, getProfileNames, getUserForms, editGender } from "../controllers/userController.js";

const router = express.Router();


/**
 * @route GET /user
 * @description Get all users in the system
 * @access Private - Admin only
 * @returns {Array<Object>} Array of user objects
 */
router.get("/", authentication.isAuthoraized, getAllUsers);


/**
 * @route GET /user/profile/:userId
 * @description Get a specific user's profile
 * @access Public
 * @param {string} req.params.userId - User ID to fetch
 * @returns {Object} User profile details
 */
router.get("/profile", getUserInfo);


/**
 * @route POST /user/profiles
 * @description Get multiple user profiles by their IDs
 * @access Public
 * @param {Object} req.body
 * @param {string[]} req.body.userIds - Array of user IDs to fetch
 * @returns {Array<Object>} Array of user profiles with selected fields
 */
// router.post("/profiles", async (req, res) => {
//   const { userIds } = req.body;
//   const users = await User.find(
//     { _id: { $in: userIds } },
//     "name phoneNumber bookedBuses.seats checkInStatus bookedTime"
//   ); // Fetch all users at once
//   res.json(users);
// });


/**
 * @route POST /user/profilesNames
 * @description Get names of multiple users by their IDs
 * @access Public
 * @param {Object} req.body
 * @param {string[]} req.body.userIds - Array of user IDs to fetch
 * @returns {Array<Object>} Array of user names
 */
router.post("/profilesNames", getProfileNames);


/**
 * @route GET /user/bus/:id
 * @description Get all buses booked by a specific user (seat-based)
 * @access Public
 * @param {string} req.params.id - User ID
 * @returns {Array<Object>} Array of bus details
 */
// router.get("/bus/:id", async (req, res) => {
//   try {
//     const users = await User.find({ _id: req.params.id });
//     // res.json(users);
//     // res.json(users.map(user => user.bookedBuses.BusId));
//     const busIds = users.map((user) => user.bookedBuses.BusId);
//     // const objIds = [busIds.map(id => new mongoose.Types.ObjectId(id))];
//     const avBuses = await Bus.find({ _id: { $in: busIds } });
//     res.json(avBuses);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


/**
 * @route GET /user/form-based-bus/:id
 * @description Get all buses booked by a specific user (form-based)
 * @access Public
 * @param {string} req.params.id - User ID
 * @returns {Array<Object>} Array of bus form details
 */
router.get("/form-based-bus/:id", getUserForms);


/**
 * @route DELETE /user/bus/:id
 * @description Delete a user and their bookings
 * @access Public
 * @param {string} req.params.id - User ID to delete
 * @returns {Object} Success/failure message
 */
// router.delete("/bus/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (user) {
//       await user.deleteOne();
//       res.json({ message: "User removed" });
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

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
    // add it to boking history too. 

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
router.put("/edit-gender/:userId", authentication.isAuthenticated, editGender);


export default router;
