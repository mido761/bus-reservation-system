const mongoose = require('mongoose');

/**
 * @typedef {Object} Seat
 * @property {mongoose.Types.ObjectId} busId - Reference to the Bus model
 * @property {string} route - The route associated with this seat
 * @property {mongoose.Types.ObjectId} bookedBy - Reference to the User who booked this seat
 * @property {Date} bookedTime - Timestamp when the seat was booked
 * @property {('Male'|'Female')} bookerGender - Gender of the passenger
 * @property {boolean} checkInStatus - Whether the passenger has checked in
 */

/**
 * Mongoose schema for Seat model
 * Used to track individual seat bookings and their status
 * @type {mongoose.Schema<Seat>}
 */
const SeatSchema = new mongoose.Schema({
    busId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bus' 
    },
    route: {
        type: String, 
        required: true
    },
    bookedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    bookedTime: {
        type: Date, 
        required: true
    },
    bookerGender: { 
        type: String, 
        enum: ["Male", "Female"], 
        required: false, 
        default: "Male" 
    },
    checkInStatus: { 
        type: Boolean, 
        default: false 
    },
});

module.exports = mongoose.model('Seat', SeatSchema);
