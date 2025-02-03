const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    busId: {type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required:true},
    userName: {type: String, required:true},
    seatsBooked: {type: Number, required:true},
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;