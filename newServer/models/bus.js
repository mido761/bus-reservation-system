const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
    seatsId: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
        }
    ],
    blateNumber:{
        type:Number,
        required:true
    },
    busType:{
        type:String,
    },
    capacity:{
        type:Number
    },
    features:{
        type:Array
    },
    IsActive:{
        type:Boolean,
        default:false,
    }
});

module.exports = mongoose.model("Bus", BusSchema);