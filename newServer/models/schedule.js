const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    busId:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
        }
    ],
    routeId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Route' 
    },
    departureTime:{type:DateTime,required:true},
    arrivalTime:{type:DateTime,required:true},
    // departureDate:{type:String,required:true},
    // arrivalDate:{type:String,required:true},
    avaibleSeats:{type:Number},
    Status:{
        type: String,
        enum: ["accepted", "cancelled", "completed","pending",'failed'],
        default: "pending",
    }   
    
});

module.exports = mongoose.model("Schedule", ScheduleSchema);