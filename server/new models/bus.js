const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
    seatsId:{ 
        type: Array, 
        ref: 'Seat' 
    },
    blateNumber:{
        type:Number,
        required:true
    },
    busType:{
        type:String,
        required,
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