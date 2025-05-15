const mongoose = require("mongoose");

/**
 * @typedef {Object} BlackList
 * @property {mongoose.Types.ObjectId} seatId - Reference to the Seat model (optional)
 * @property {mongoose.Types.ObjectId} userId - Reference to the User model
 * @property {string} reason - Reason for blacklisting the user
 */

/**
 * Mongoose schema for BlackList model
 * Used to track blacklisted users and their associated seats
 * @type {mongoose.Schema<BlackList>}
 */
const BlackList = new mongoose.Schema({
    seatId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Seat',
        required: false
    },
    // busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus',required:false}, // Assuming you have a Bus model
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    reason: {
        type: String, 
        required: true
    }
});

module.exports = mongoose.model("BlackList", BlackList);