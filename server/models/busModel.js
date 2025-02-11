
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
        reservedSeats: [ReservedSeatSchema],  
        availableSeats: {type: Number, required: false}
    },
    schedule: {type: String, required:false},
    minNoPassengers: {type: Number, required: false},
    price : {type: Number, required: false},
    location: {
        pickupLocation: {type: String, required: false},
        arrivalLocation: {type: String, required: false},        
    },
    time: {
        departureTime: {type: Number, required: false},
        arrivalTime: {type: Number, required: false},        
    },
    allowance: {
        cancelTimeAllowance: {type: Number, required: false},
        bookingTimeAllowance: {type: Number, required: false},        
    },
    allowedNumberOfBags: {type: Number}
});

module.exports = mongoose.model('Bus', BusSchema);
