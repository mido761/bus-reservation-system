const express = require('express');
const Booking = require('../models/bookingModel');
const Bus = require('../models/busModel');
const router = express.Router();

// Book a bus seat
router.post('/book', async (req, res) => {
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