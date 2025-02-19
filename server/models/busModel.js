
const mongoose = require('mongoose');

const ReservedSeatSchema = new mongoose.Schema({
    seatNumber: { type: String, required: true },
    reservedBy: { type: String, required: true },
    expiryDate: { 
      type: Date, 
      required: true, 
      default: () => new Date(Date.now() + 10 * 60 * 1000) // Expires in 10 minutes
    },
  });

const BusSchema = new mongoose.Schema({
    seats: {
        totalSeats: {type: Number, required: true},
        bookedSeats: [{type: String,  required: false}],
        reservedSeats: { type: [ReservedSeatSchema], default: [] },
        availableSeats: {type: Number, required: false}
    },
    schedule: {type: String, required:true},
    minNoPassengers: {type: Number, required: false},
    price : {type: Number, required: false},
    location: {
        pickupLocation: {type: String, required: true},
        arrivalLocation: {type: String, required: true},        
    },
    time: {
        departureTime: {type: String, required: true},
        arrivalTime: {type: String, required: true},        
    },
    allowance: {
        cancelTimeAllowance: {type: Number, required: false},
        bookingTimeAllowance: {type: Number, required: false},        
    },
    allowedNumberOfBags: {type: Number, required: false}
});

module.exports = mongoose.model('Bus', BusSchema);
