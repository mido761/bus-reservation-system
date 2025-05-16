const mongoose = require('mongoose');

/**
 * @typedef {Object} ReservedSeat
 * @property {string} seatNumber - The unique identifier for the seat
 * @property {string} reservedBy - ID or name of the user who reserved the seat
 */

/**
 * Schema for tracking reserved seats in a bus
 * @type {mongoose.Schema<ReservedSeat>}
 */
const ReservedSeatSchema = new mongoose.Schema({
    seatNumber: { type: String, required: true },
    reservedBy: { type: String, required: true },
    // expiryDate: { 
    //   type: Date, 
    //   required: true, 
    //   default: () => new Date(Date.now() + 10 * 60 * 1000) // Expires in 10 minutes
    // },
  });

/**
 * @typedef {Object} BusSeats
 * @property {number} totalSeats - Total number of seats in the bus
 * @property {string[]} bookedSeats - Array of booked seat numbers
 * @property {string[]} genders - Array of passenger genders corresponding to booked seats
 * @property {ReservedSeat[]} reservedSeats - Array of temporarily reserved seats
 * @property {number} availableSeats - Number of seats still available
 */

/**
 * @typedef {Object} BusLocation
 * @property {string} pickupLocation - Starting point of the journey
 * @property {string} arrivalLocation - Destination point of the journey
 */

/**
 * @typedef {Object} BusTime
 * @property {string} departureTime - Time when the bus departs
 * @property {string} arrivalTime - Expected arrival time
 */

/**
 * @typedef {Object} BusAllowance
 * @property {number} cancelTimeAllowance - Time limit for cancellation (in minutes)
 * @property {number} bookingTimeAllowance - Time limit for booking (in minutes)
 */

/**
 * @typedef {Object} Bus
 * @property {BusSeats} seats - Seating information
 * @property {string} schedule - Bus schedule/frequency
 * @property {number} minNoPassengers - Minimum number of passengers required
 * @property {number} price - Ticket price
 * @property {BusLocation} location - Pickup and arrival locations
 * @property {BusTime} time - Departure and arrival times
 * @property {BusAllowance} allowance - Booking and cancellation time limits
 * @property {number} busNumber - Unique bus identifier
 * @property {number} allowedNumberOfBags - Maximum bags allowed per passenger
 */

/**
 * Mongoose schema for Bus model
 * @type {mongoose.Schema<Bus>}
 */
const BusSchema = new mongoose.Schema({
    seats: {
        totalSeats: { type: Number, required: true },
        bookedSeats: [{ type: String, required: false }],
        genders: [{ type: String, required: false }],
        reservedSeats: { type: [ReservedSeatSchema], default: [] },
        availableSeats: { type: Number, required: false }
    },
    schedule: { type: String, required: true },
    minNoPassengers: { type: Number, required: false },
    price: { type: Number, required: false },
    location: {
        pickupLocation: { type: String, required: true },
        arrivalLocation: { type: String, required: true },        
    },
    time: {
        departureTime: { type: String, required: true },
        arrivalTime: { type: String, required: true },        
    },
    allowance: {
        cancelTimeAllowance: { type: Number, required: false },
        bookingTimeAllowance: { type: Number, required: false },        
    },
    busNumber: { type: Number, required: false, default: "1234" },
    allowedNumberOfBags: { type: Number, required: false }
});

module.exports = mongoose.model('Bus', BusSchema);
