import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
    seatsId: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
        }
    ],
    plateNumber:{
        type:String,
        required:true
    },
    busType:{
        type:String,
        default:"microBus"
    },
    capacity:{
        type:Number
    },
    features:{
        type:Array,
        default:["aircondition"]
    },
    IsActive:{
        type:Boolean,
        default:false,
    }
});

export default mongoose.model("Bus", BusSchema);