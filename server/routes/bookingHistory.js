const express = require('express');
const BookingHistory = require("../models/bookingHistory")
const router = express.Router();

// Check user specific history
router.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // const {busId, userName, seatsBooked} = req.body;
        const bookingHistory = await BookingHistory.find({bookedBy:userId});
        if (!bookingHistory){
            return res.status(400).json({message: 'Not booking history find'});
        }
        return res.status(200).json({ message: 'Booking history successfully found!', bookingHistory: bookingHistory});
    } catch (err){
        return res.status(400).json({ message: 'Error finding booking history', error:err});
    }
});


// Search all users
router.post('/admin', async (req, res) => {
    try {
        const {schedule} = req.body;
        console.log(schedule)
        let newschedule = new Date(schedule)
        console.log(newschedule)
        const bookingHistory = await BookingHistory.find({schedule:newschedule});
        if (!bookingHistory){
            return res.status(400).json({message: 'Not booking history find'});
        }
        res.status(200).json({ message: 'Booking history successful find', bookingHistory: bookingHistory});
    } catch (err){
        res.status(400).json({ message: 'Error finding booking history', error:err});
    }
});


module.exports = router;