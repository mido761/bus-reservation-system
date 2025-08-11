const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
    busId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bus' 
    },
    seatNumber:{
        type:Number,
        required:true
    },
    seatType:{
        type:String,
        default:"microbusSeat"
    },
    isAvalable:{
        type:Boolean,
        default:true,
    }
});

module.exports = mongoose.model("Seat", SeatSchema);