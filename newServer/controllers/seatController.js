import pool from "../db.js";

const getSeats = async (req, res) => {
  try {
    const getSeatsQ = "select * from seat";
    const { rows: seats } = await pool.query(getSeatsQ);

    return res.status(200).json(seats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBusSeats = async (req, res) => {
  const busId = req.params.busId;
  try {
    const getBusSeatsQ = `
    SELECT * 
    FROM seat
    WHERE bus_id = $1
    ORDER BY seat_number
    `;

    const { rows: busSeats } = await pool.query(getBusSeatsQ, [busId]);

    return res.status(200).json({ bus: busId, seats: busSeats });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const checkInOut = async (req, res) => {
  const { seatId, status } = req.body;
  console.log(req.session.userId);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateSeatQ = `
    UPDATE seat 
    SET status = $1
    WHERE seat_id = $2
    RETURNING seat_number, status, bus_id
    `;

    const { rows: seatRows } = await client.query(updateSeatQ, [
      status,
      seatId,
    ]);

    if (seatRows.length === 0) {
      throw new Error("Seat not found");
    }
    const seat = seatRows[0]; // first row
    const busId = seat.bus_id;
    // const getTripQ = `
    // SELECT trip_id
    // FORM trip_bus
    // WHERE bus_id = $1
    // `;
    // const { rows: tirpId } = await pool.query(getTripQ, [busId]);

    const updateBookingQ = `
    UPDATE booking 
    SET seat_id = $1
    WHERE trip_id = (
        SELECT tb.trip_id
        FROM trip_bus tb
        JOIN  trips t ON tb.trip_id = t.trip_id
        WHERE tb.bus_id = $2
        ORDER BY t.departure_time ASC
        LIMIT 1
    )
    AND passenger_id = $3
    RETURNING booking_id, passenger_id, seat_id, status
    `;

    //  AND (t.date + t.departure_time) >= NOW()
    //         AND (t.date + t.departure_time) <= NOW() + interval '1 hour'

    const { rows: bookingRows } = await client.query(updateBookingQ, [
      seatId,
      busId,
      req.session.userId,
    ]);

    if (bookingRows.length === 0) {
      throw new Error("Error updating booking!");
    }
    await client.query("COMMIT");
    return res.status(200).json({ updatedBooking: bookingRows });
  } catch (error) {
    await client.query("ROLLBACK");

    return res.status(500).json({ message: error.message });
  }
};

// const addStop = async (req, res) => {
//   const {stopName,location,distanceFromSource} = req.body;
//   try{
//     const checkQuery = 'SELECT * FROM stop WHERE stop_name = $1 LIMIT 1';
//     const checkResult = await pool.query(checkQuery, [stopName]);

//     if (checkResult.rows.length > 0) {
//       return res.status(400).json("This Stop Name already exists!!");
//     }

//     const insertQuery = `
//       INSERT INTO stop (stop_name, location, distance_from_source)
//       VALUES ($1, $2, $3)
//       RETURNING *;
//     `;
//     const insertResult = await pool.query(insertQuery, [stopName, location, distanceFromSource]);

//     const newStop = insertResult.rows[0];
//     return res.status(200).json("Stop added successfully!");
//   }catch(error){
//     return res.status(500).json({ message: error.message });
//   }
// };
// const editStop = async (req, res) => {
// //dont know
// };

// const delStop = async (req, res) => {
// const { stopId } = req.body;
// try {
//   // 1. Check if stop exists
//   const checkQuery = 'SELECT * FROM stop WHERE stop_id = $1 LIMIT 1';
//   const checkResult = await pool.query(checkQuery, [stopId]);

//   if (checkResult.rows.length === 0) {
//     return res.status(404).json("Stop not found!");
//   }

//   // 2. Delete stop
//   const deleteQuery = 'DELETE FROM stop WHERE stop_Id = $1 RETURNING *';
//   const deleteResult = await pool.query(deleteQuery, [stopId]);

//   const deletedStop = deleteResult.rows[0];

//   return res.status(200).json({
//     message: "Stop deleted successfully!",
//     stop: deletedStop,
//   });
// } catch (error) {
//   console.error(error);
//   return res.status(500).json({ message: error.message });
// }

// };

export { getSeats, getBusSeats, checkInOut };
