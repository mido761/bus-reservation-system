const Bus = require("../models/bus");
const Seat = require("../models/seats")
const getAvailableBuses = async (req, res) => {
  try {
    const availableBuses = await Bus.find();

    return res.status(200).json(availableBuses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const addBus = async (req, res) => {
  const { plateNumber, busType, capacity, features, IsActive, seatType } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Check required fields
    if (!(blateNumber && capacity)) {
      return res.status(400).json("You should fill PlateNumber & capacity & features!");
    }

    // 2️⃣ Check for duplicate blateNumber
    const exists = await Bus.findOne({ blateNumber }).session(session);
    if (exists) {
      return res.status(400).json("This blateNumber already exists!!");
    }

    // 3️⃣ Create & save bus
    let newBus = new Bus({
      plateNumber,
      busType,
      capacity,
      features,
      IsActive
    });

    await newBus.save({ session });

    // 4️⃣ Prepare seat array
    let seatsArray = [];
    for (let i = 0; i < capacity; i++) {
      seatsArray.push({
        busId: newBus._id,
        seatNumber: i + 1,
        seatType
      });
    }

    // 5️⃣ Insert seats
    const newSeats = await Seat.insertMany(seatsArray, { session });
    const seatIds = newSeats.map(seat => seat._id);

    // 6️⃣ Update bus with seat IDs
    newBus.seatsId = seatIds;
    await newBus.save({ session });

    // 7️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log(`${capacity} seats created for bus ${newBus._id}`);
    return res.status(200).json("Bus added successfully!");
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
  

};
const editBus = async (req, res) => {

};

const delBus = async (req, res) => {

};

module.exports = { getAvailableBuses,addBus,editBus,delBus };
