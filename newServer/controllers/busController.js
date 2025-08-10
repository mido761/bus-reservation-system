const Bus = require("../models/bus");

const getAvailableBuses = async (req, res) => {
  try {
    const availableBuses = await Bus.find();

    return res.status(200).json(availableBuses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getAvailableBuses };
