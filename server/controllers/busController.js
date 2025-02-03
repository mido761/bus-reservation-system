const Bus = require('../models/busModel');


// Get all buses
const getBuses = async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Add a new bus
const addBus = async (req, res) => {
    const bus = new Bus (req.body);
    try {
        const newBus = await bus.save();
        res.status(201).json(newBus);
    } catch (err) {
        res.status(400).json({ message:err.message})
    }
};

module.exports = {getBuses, addBus};