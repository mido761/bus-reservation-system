const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    bookedTime: {type: Date, required:true},
    bookerGender: { type: String, enum: ["Male", "Female"], required: false, default:"Male" }, // Added gender field
    checkInStatus: { type: Boolean, default: false }, // New field for check-in status
});

module.exports = mongoose.model('Seat', SeatSchema);
