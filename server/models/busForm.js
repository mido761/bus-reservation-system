const mongoose = require('mongoose');

/**
 * @typedef {Object} BusLocation
 * @property {string} pickupLocation - Starting point of the journey
 * @property {string} arrivalLocation - Destination point of the journey
 */

/**
 * @typedef {Object} BusAllowance
 * @property {number} cancelTimeAllowance - Time limit for cancellation in milliseconds (default: 3 hours)
 * @property {number} bookingTimeAllowance - Time limit for booking in milliseconds
 */

/**
 * @typedef {Object} BusForm
 * @property {string} schedule - Bus schedule/frequency
 * @property {number} price - Ticket price
 * @property {BusLocation} location - Pickup and arrival locations
 * @property {string} departureTime - Time of departure
 * @property {BusAllowance} allowance - Booking and cancellation time limits
 */

/**
 * Mongoose schema for BusForm model
 * Used to create templates for bus schedules and routes
 * @type {mongoose.Schema<BusForm>}
 */
const BusFormSchema = new mongoose.Schema({
    // bookedSeats: [{type: mongoose.Schema.Types.ObjectId, ref: "Seat"}],      
    schedule: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        required: false
    },
    location: {
        pickupLocation: {
            type: String, 
            required: true
        },
        arrivalLocation: {
            type: String, 
            required: true
        },        
    },
    departureTime: {
        type: String, 
        required: true
    },
    allowance: {
        cancelTimeAllowance: {
            type: Number, 
            required: false,  
            default: 3 * 60 * 60 * 1000  // 3 hours in milliseconds
        },
        bookingTimeAllowance: {
            type: Number, 
            required: false
        },        
    }
});

module.exports = mongoose.model('BusForm', BusFormSchema);
