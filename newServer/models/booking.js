import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    scheduleId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Schedule' 
    },
    passangerId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    stopId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Stop' 
    },
    seatId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Seat' 
    },
    paymentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Payment'
    },
    // paymentStatus: {
    // type: String,
    // enum: ["sucsseful","pending",'failed'],
    // default: "pending",
    // },
    //the ticket only should have a booking id
    ticketId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ticket' 
    },
    Status: {
    type: String,
    enum: ["accepted", "cancelled", "completed","pending",'failed'],
    default: "pending",
    },
    // bookedDate: {
    //     type: Date, 
    //     required: true
    // },
    createdAt: { type: Date, default: Date.now },
    
});

export default mongoose.model("Booking", BookingSchema);