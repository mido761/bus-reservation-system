const { DateTime } = require("luxon");
const mongoose = require("mongoose");

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

module.exports = mongoose.model("Refund", RefundSchema);