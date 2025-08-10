const Stop = require("../models/stop");

const getStops = async (req, res) => {
  try {
    const stops = await Stop.find();

    return res.status(200).json(stops);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getStops };
