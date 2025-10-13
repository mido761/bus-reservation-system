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
  try {
    const userId =req.session.userId
    const getUser = `SELECT username, email, phone_number FROM users WHERE user_id = $1`;
    const { rows } = await pool.query(getUser, [userId]);
    const user = rows[0];

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAllUsers, getUserInfo };
