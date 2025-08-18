import mongoose from "mongoose";

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

export default mongoose.model("Stop", StopSchema);