const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
    busId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bus' 
    },
    SeatNubmer:{
        type:Number,
        required:true
    },
    seatType:{
        type:String
    },
    isAvalable:{
        type:Boolean,
        default:true,
    }
});

module.exports = mongoose.model("Seat", SeatSchema);