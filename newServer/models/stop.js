const mongoose = require("mongoose");

const StopSchema = new mongoose.Schema({
    routeId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Route' 
    },
    stopName:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:false
    },
    distanceFromSource:{
        type:Number,
        required:true
    },
    
});

module.exports = mongoose.model("Stop", StopSchema);