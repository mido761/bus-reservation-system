const mongoose = require('mongoose');

const BusFormSchema = new mongoose.Schema({
    bookedSeats: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true}],      
    schedule: {type: String, required:true},
    price : {type: Number, required: false},
    location: {
        pickupLocation: {type: String, required: true},
        arrivalLocation: {type: String, required: true},        
    },
    departureTime: {type: String, required: true},
    allowance: {
        cancelTimeAllowance: {type: Number, required: false},
        bookingTimeAllowance: {type: Number, required: false},        
    }
});

module.exports = mongoose.model('BusForm', BusFormSchema);
