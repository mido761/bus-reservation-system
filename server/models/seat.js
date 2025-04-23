const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    seatNumber: { type: String, required: true },
    bookedBy: { type: String, required: true },
});

module.exports = mongoose.model('Seat', SeatSchema);
