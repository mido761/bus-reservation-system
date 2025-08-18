import mongoose from "mongoose";

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

export default mongoose.model("Seat", SeatSchema);