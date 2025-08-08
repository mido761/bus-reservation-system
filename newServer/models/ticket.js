const { DateTime } = require("luxon");
const mongoose = require("mongoose");

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

module.exports = mongoose.model("Ticket", TicketSchema);