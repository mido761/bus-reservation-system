/** 
 * @route GET /seats/:id
 * @route GET /seats/driver-list/:id
 * @route POST /seats/user/:id
 * @route PUT /seats/check-in/:seatId
 * @route PUT /seats/check-out/:seatId
*/

/**
 * @file seats.js
 * @description Core seat management functionality for the Bus Reservation System.
 * Handles seat information retrieval, check-in/out operations, and passenger management.
 * @module SeatRoutes
 */
const express = require("express");
const router = express.Router();
const {getAllSeatsForBus, getSeatsListForDrivers, getSeatInfo, checkIn, checkOut} = require("../controllers/seatController")



/**
 * @route GET /seats/:id
 * @description Get all seats and their booking details for a specific bus
 * @access Public
 * @param {string} req.params.id - Bus ID
 * @returns {Object} Response object
 * @property {Array<Object>} seats - Array of seat objects with booking info
 * @property {Array<Object>} orderedUsers - Array of user details who booked seats
 * @throws {404} If bus not found
 * @throws {500} For server errors
 */
router.get("/:id", getAllSeatsForBus)


/**
 * @route GET /seats/driver-list/:id
 * @description Get passenger list for driver's reference, including seat assignments
 * @access Public
 * @param {string} req.params.id - Bus ID
 * @returns {Object} Response object
 * @property {Array<Object>} passengerList - Array of passenger details with routes
 * @throws {404} If bus not found
 * @throws {500} For server errors
 */
router.get("/driver-list/:id", getSeatsListForDrivers)


/**
 * @route POST /seats/user/:id
 * @description Get seat information for a specific user on a bus
 * @access Public
 * @param {string} req.params.id - Bus ID
 * @param {string} req.body.userId - User ID
 * @returns {Object} Response object
 * @property {Array<Object>} finalSeatsArr - Array of seat details with booking status
 * @throws {404} If bus not found
 * @throws {500} For server errors
 */
router.post("/user/:id", getSeatInfo)


/**
 * @route PUT /seats/check-in/:seatId
 * @description Mark a seat as checked in for passenger tracking
 * @access Public
 * @param {string} req.params.seatId - Seat ID
 * @returns {Object} Updated seat information
 * @throws {404} If seat not found
 * @throws {500} For server errors
 */
router.put("/check-in/:seatId", checkIn);


/**
 * @route PUT /seats/check-out/:seatId
 * @description Mark a seat as checked out when passenger leaves
 * @access Public
 * @param {string} req.params.seatId - Seat ID
 * @returns {Object} Updated seat information
 * @throws {404} If seat not found
 * @throws {500} For server errors
 */
router.put("/check-out/:seatId", checkOut);  


module.exports = router;
