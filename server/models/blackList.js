const mongoose = require("mongoose");
const BlackList = new mongoose.Schema({
    seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat',required:false},
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus',required:false}, // Assuming you have a Bus model
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true},
});

module.exports = mongoose.model("BlackList", BlackList);