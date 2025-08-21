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

  const client = await pool.connect(); // Get a client from the pool
  try {
    await client.query('BEGIN'); // Start transaction

    if (!(plateNumber && capacity)) {
      return res.status(400).json("You should fill plateNumber & capacity & features!");
    }

    // 🔎 Check if bus already exists
    const checkQuery = 'SELECT * FROM bus WHERE plate_number = $1';
    const BlateNumberInData = await client.query(checkQuery, [plateNumber]);

    if (BlateNumberInData.rows.length > 0) {
      await client.query('ROLLBACK'); // rollback transaction
      return res.status(400).json("This plateNumber already exists!!");
    }

    // 🚍 Insert bus
    const insertQuery = `
      INSERT INTO bus (plate_number, bus_type, capacity, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const Now = DateTime.now();
    const insertBus = await client.query(insertQuery, [
      plateNumber,
      busType,
      capacity,
      isActive,
      Now,
    ]);
    const newBus = insertBus.rows[0];

    // 💺 Insert seats for this bus
    const insertSeats = await client.query(
      `INSERT INTO seat (bus_id, seat_number, seat_type, status)
       SELECT $1, gs, $2, 'Available'
       FROM generate_series(1, $3) gs
       RETURNING *;`,
      [newBus.bus_id, seatType, capacity]
    );

    // ✅ Commit transaction if everything succeeds
    await client.query('COMMIT');

    console.log(`${capacity} seats created for bus ${newBus.bus_id}`);

    return res.status(200).json({
      message: "Bus added successfully!",
      bus: newBus,
      seats: insertSeats.rows,
    });
  } catch (error) {
    await client.query('ROLLBACK'); // ❌ rollback if anything fails
    return res.status(500).json({ message: error.message });
  } finally {
    client.release(); // release client back to pool
  }
};




const editBus = async (req, res) => {

};

const delBus = async (req, res) => {

};

export { getAvailableBuses, addBus, editBus, delBus };
