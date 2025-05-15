const mongoose = require('mongoose');

/**
 * @typedef {Object} Booking
 * @property {mongoose.Types.ObjectId} busId - Reference to the Bus model
 * @property {string} userName - Name of the user making the booking
 * @property {number} seatsBooked - Number of seats booked
 */

/**
 * Mongoose schema for Booking model
 * Used to track bus bookings and seat allocations
 * @type {mongoose.Schema<Booking>}
 */
const bookingSchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bus', 
        required: true
    },
    userName: {
        type: String, 
        required: true
    },
    seatsBooked: {
        type: Number, 
        required: true
    },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;