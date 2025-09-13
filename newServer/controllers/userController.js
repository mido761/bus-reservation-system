import validator from "validator";
import pool from "../db.js";
import mongoose from "mongoose";

// Get all users in the system
const getAllUsers = async (req, res) => {
  try {
    const getUsers = `SELECT username, email FROM users`;
    const { rows } = await pool.query(getUsers);
    const users = rows[0];

    return res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific user's profile
const getUserInfo = async (req, res) => {
  ////////////////////////////////////////////////// need correction
  // const userId = req.params.userId;
  try {
    // if (!validator.isUUID(req.params.userId)) {
    //   return res.status(400).json("Invalid UUID format");
    // }
    // console.log("session: ", req.session);
    // if (req.session.userId.toString() !== req.params.userId) {
    //   return res.status(403).json("Access denied");
    // }
    const userId =req.session.userId
    const getUser = `SELECT username, email, phone_number FROM users WHERE user_id = $1`;
    const { rows } = await pool.query(getUser, [userId]);
    const user = rows[0];

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get multiple user profiles by their IDs
const getProfileNames = async (req, res) => {
  const { userIds } = req.body;

  try {
    const getUsersNames = `
      SELECT user_id, username
      FROM users
      WHERE user_id = ANY($1)
    `;

    const { rows } = await pool.query(getUsersNames, [userIds]);
    const users = rows[0]

    res.json(users);
  } catch (err) {
    console.error('Error getting users names: ', err.message)
  }
};

// Get all buses booked by a specific user (form-based)
//still not converted
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
    const userId = req.params.userId;
    const { gender } = req.body; // ✅ Extract gender

    if (!gender) return res.status(400).json({ error: "Gender is required" });

    const updateGender = `
    UPDATE users SET gender = $1 WHERE user_id = $2 RETURNING username, gender
    `;

    const { rows } = await pool.query(updateGender, [gender, userId]);

    const user = rows[0];

    console.log(user);
    if (!user) {
      return res.json({ message: "Error updating gender!" });
    }

    return res.json({ message: "Gender updated successfully", user });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export { getAllUsers, getUserInfo, getProfileNames, getUserForms, editGender };
