import Bus from "../models/bus.js";
import Seat from "../models/seats.js";
import mongoose from "mongoose";


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

try {
  if (!(plateNumber && capacity)) {
    return res.status(400).json("You should fill blateNumber & capacity & features!");
  }

  const BlateNumberInData = await Bus.find({ plateNumber: plateNumber });

  if (BlateNumberInData.length > 0) {
    return res.status(400).json("This blateNumber already exists!!");
  }

  // 1️⃣ Save bus first
  let newBus = new Bus({
    plateNumber,
    busType,
    capacity,
    features,
    IsActive
  });

  await newBus.save();

  // 2️⃣ Create seats with the saved bus's _id
  let newSeatsArray = [];
  for (let i = 0; i < capacity; i++) {
    newSeatsArray.push({
      busId: newBus._id,
      seatNumber: i + 1,
      seatType
    });
  }

  // 3️⃣ Bulk insert seats
  const newSeats = await Seat.insertMany(newSeatsArray);

  // 4️⃣ Update bus with seat IDs
  newBus.seatsId = newSeats.map(seat => seat._id);
  await newBus.save();

  console.log(`${capacity} seats created for bus ${newBus._id}`);

  return res.status(200).json("Bus added successfully!");
} catch (error) {
  return res.status(500).json({ message: error.message });
}

};



const editBus = async (req, res) => {

};

const delBus = async (req, res) => {

};

export { getAvailableBuses, addBus, editBus, delBus };
