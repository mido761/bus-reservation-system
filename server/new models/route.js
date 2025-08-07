const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema({
    scheduleId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Schedule' 
    },
    source:{
        type:String,
        required:true
    },
    destination:{
        type:String,
        required:true
    },
    distance:{
        type:Number,
        required:true
    },
    estimatedDuration:{
        type:Number,
        required:true
    },
    stops:{
        type:Array,
    },
    isActive:{
        type:Boolean,
        default:true
    }
});

module.exports = mongoose.model("Route", RouteSchema);