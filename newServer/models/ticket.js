import { DateTime } from "luxon";
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
    bookongId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking' 
    },
    issueTime:{
        type:DateTime,
        required:true
    },
    barcode:{
        type:String,
    },
    Status:{
        type:String
    }
});

export default mongoose.model("Ticket", TicketSchema);