import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema({
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
    stops: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop'
        }
    ],
    isActive:{
        type:Boolean,
        default:true
    }
});

export default mongoose.model("Route", RouteSchema);