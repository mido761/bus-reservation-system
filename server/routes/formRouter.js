const express = require("express");
const {getForms, getFormByID, addNewForm, updateForm, deleteForm} = require("../controllers/formController");
const middleware = require("../controllers/middleware");

const router = express.Router();



/**
 * @route GET /buses
 * @description Get all bus form templates
 * @access Public
 * @returns {Array<Object>} Array of bus form templates
 */
router.get("/", middleware.isAuthenticated, getForms);


/**
 * @route GET /buses/:id
 * @description Get a specific bus form template by ID
 * @access Private - Authenticated users only
 * @param {string} req.params.id - Bus ID
 * @returns {Object} Bus form template details
 */
router.get("/:id", middleware.isAuthenticated, getFormByID)

/** 
 * @route POST /buses/formbuses
 * @description Create a new bus form template
 * @access Private - Admin only
 * @param {Object} req.body
 * @param {string} req.body.schedule - Bus schedule
 * @param {number} req.body.price - Ticket price
 * @param {string} req.body.pickupLocation - Starting point
 * @param {string} req.body.arrivalLocation - Destination
 * @param {string} req.body.departureTime - Time of departure
 * @param {number} req.body.cancelTimeAllowance - Cancellation time limit
 * @param {number} req.body.bookingTimeAllowance - Booking time limit
 * @returns {Object} Message indicating success or failure
 */
router.post("/add-form", middleware.isAuthoraized, addNewForm);

// Update Form
router.put("/edit-form/:busId", middleware.isAuthoraized, updateForm);

// Delete Form
router.delete("/del-form/:id", middleware.isAuthoraized, deleteForm);


module.exports = router;