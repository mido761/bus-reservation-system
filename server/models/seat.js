const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'BusForm' },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Seat', SeatSchema);
