const mongoose = require("mongoose");

const StopSchema = new mongoose.Schema({
    stopName:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:false
    },
    // distanceFromSource:{
    //     type:Number,
    //     required:true
    // },
    
});

module.exports = mongoose.model("Stop", StopSchema);