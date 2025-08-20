import Bus from "../models/bus.js";
import Seat from "../models/seats.js";
import mongoose from "mongoose";
import pool from "../db.js"
import { DateTime } from "luxon";


const getAvailableBuses = async (req, res) => {
  try {
    const searchQuery = 'select * from bus'
    const {row} = await pool.query(searchQuery);
    const availableBuses = row
    return res.status(200).json({buses: availableBuses});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const addBus = async (req, res) => {
  const { plateNumber, busType, capacity, isActive = true, seatType = 'V' } = req.body;

  try {
    if (!(plateNumber && capacity)) {
      return res.status(400).json("You should fill blateNumber & capacity & features!");
    }

    const checkQuery = 'SELECT * FROM bus WHERE plate_number = $1';
    const BlateNumberInData = await pool.query(checkQuery,[plateNumber]);

    if (BlateNumberInData.rows.length > 0) {
      return res.status(400).json("This blateNumber already exists!!");
    }

    const insertQuery =
    `INSERT INTO bus (plate_number, bus_type, capacity, is_active,created_at)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *;`
    const Now = DateTime.now()
    const insertBus = await pool.query(insertQuery, [plateNumber, busType, capacity, isActive,Now])
    const newBus = insertBus.rows[0];
    console.log(newBus)

    // 4️⃣ Generate seats data
    const seatValues = [];
    for (let i = 0; i < capacity; i++) {
      seatValues.push(`${newBus.bus_id}, ${i + 1}, '${seatType}', 'A'`);
    }
    console.log("INSERT VALUES:", seatValues.join(", "));
        // 5️⃣ Bulk insert seats
    const insertSeats = await pool.query(
      `INSERT INTO seat (bus_id, seat_number, seat_type, status)
      SELECT '${newBus.bus_id}', gs, 'normalSeat', 'Available'
      FROM generate_series(1, ${capacity}) gs;`
    );
    //     const insertSeats = await pool.query(
    //   `INSERT INTO seat (bus_id, seat_number, seat_type, status)
    //     VALUES ${seatValues.join(", ")}
    //     RETURNING*;`
    // );

    console.log(`${capacity} seats created for bus ${newBus._id}`);

    return res.status(200).json({
      message: "Bus added successfully!",
      bus: newBus,
      seats: insertSeats.rows
    });
  }catch (error) {
    return res.status(500).json({ message: error.message });
  }

};



const editBus = async (req, res) => {

};

const delBus = async (req, res) => {

};

export { getAvailableBuses, addBus, editBus, delBus };
