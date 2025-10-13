import express from "express";
import authentication from "../middleware/authentication.js";
import { getAllUsers, getUserInfo } from "../controllers/userController.js";

const router = express.Router();


/**
 * @route GET /user
 * @description Get all users in the system
 * @access Private - Admin only
 * @returns {Array<Object>} Array of user objects
 */
// router.get("/", authentication.isAuthoraized, getAllUsers);


/**
 * @route GET /user/profile/:userId
 * @description Get a specific user's profile
 * @access Public
 * @param {string} req.params.userId - User ID to fetch
 * @returns {Object} User profile details
 */
router.get("/profile", authentication.isAuthenticated, getUserInfo);

export default router;
