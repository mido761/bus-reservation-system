const express = require('express');
const BookingHistory = require("../models/bookingHistory")
const router = express.Router();

// Check user specific history
router.get('/bookingHistory-user/:id', async (req, res) => {
    try {
        const {busId, userName, seatsBooked} = req.body;
        const bus = await Bus.findById(busId);
        if (!bus || bus.availableSeats < seatsBooked){
            return res.status(400).json({message: 'Not seats available'});
        }
        const newBooking = new Booking({busId, userName, seatsBooked});
        await bus.save();

        res.status(200).json({ message: 'Booking successful', booking: newBooking});
    } catch (err){
        res.status(400).json({ message: 'Error booking the bus', error:err});
    }
});


// Search all users
router.post('/bookingHistory', async (req, res) => {
    try {
        const {busId, userName, seatsBooked} = req.body;
        const bus = await Bus.findById(busId);
        if (!bus || bus.availableSeats < seatsBooked){
            return res.status(400).json({message: 'Not seats available'});
        }
        const newBooking = new Booking({busId, userName, seatsBooked});
        await bus.save();

        res.status(200).json({ message: 'Booking successful', booking: newBooking});
    } catch (err){
        res.status(400).json({ message: 'Error booking the bus', error:err});
    }
});


module.exports = router;