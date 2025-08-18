import { DateTime } from "luxon";
import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema({
   paymentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Payment'
    },
    amount:{
        type:Number,
        required:true
    },
    reason:{
        type:String,
        required:true
    },
    Status:{
        type:String
    },
    processedDate:{ type: DateTime,required:true}
});

export default mongoose.model("Refund", RefundSchema);