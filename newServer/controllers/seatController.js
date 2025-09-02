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

const checkIn = async (req, res) => {
  const { busId, seatId } = req.body;
  const userId = req.session.userId;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Count seats already checked in by this user for this trip
    const alreadyCheckedInTestQ = `
      SELECT booking_id, passenger_id
      FROM booking
      WHERE seat_id = $1 AND status = 'checked_in'
    `;
    const { rows: alreadyCheckedIn } = await client.query(
      alreadyCheckedInTestQ,
      [seatId]
    );

    const currentPassenger = alreadyCheckedIn[0]?.passenger_id;
    if (alreadyCheckedIn.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Seat already checked in!",
        passengerId: currentPassenger,
        currentUser: userId
      });
    }

    const getTripIdQ = `
      SELECT 
        trip_bus.trip_id,
        trips.trip_id,
        trips.date,
        trips.departure_time
      FROM trip_bus
      JOIN trips
        ON trips.trip_id = trip_bus.trip_id
      WHERE bus_id = $1
        AND (trips.date + trips.departure_time) >= NOW()
        AND (trips.date + trips.departure_time) <= (NOW() + interval '1 hour')
      LIMIT 1
    `;
    const { rows: trip } = await client.query(getTripIdQ, [busId]);

    if (trip.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "This bus is not assigned to a trip in the given time window!",
      });
    }

    const tripId = trip[0].trip_id;

    // Count user's bookings for this trip
    const bookingCountQ = `
      SELECT COUNT(*) AS booking_count
      FROM booking
      WHERE trip_id = $1 AND passenger_id = $2
    `;
    const { rows: bookingCountRows } = await client.query(bookingCountQ, [
      tripId,
      userId,
    ]);
    const bookingCount = parseInt(bookingCountRows[0].booking_count, 10);

    // Count seats already checked in by this user for this trip
    const checkedInCountQ = `
      SELECT COUNT(*) AS checked_in_count
      FROM booking
      WHERE trip_id = $1 AND passenger_id = $2 AND status = 'checked_in'
    `;
    const { rows: checkedInCountRows } = await client.query(checkedInCountQ, [
      tripId,
      userId,
    ]);
    const checkedInCount = parseInt(checkedInCountRows[0].checked_in_count, 10);

    if (checkedInCount >= bookingCount) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "You cannot check in for more seats than you have bookings for this trip.",
      });
    }

    const updateSeatQ = `
    UPDATE seat 
    SET status = $1
    WHERE seat_id = $2
    RETURNING seat_number, status, bus_id
    `;

    const { rows: seatRows } = await client.query(updateSeatQ, [
      'Booked',
      seatId,
    ]);

    if (seatRows.length === 0) {
      throw new Error("Seat not found");
    }
    const seat = seatRows[0]; // first row

    const updateBookingQ = `
    UPDATE booking 
    SET seat_id = $1, 
        status = 'checked_in'
    WHERE trip_id = $2
    AND passenger_id = $3
    RETURNING booking_id, passenger_id, trip_id, seat_id, status
    `;

    const { rows: bookingRows } = await client.query(updateBookingQ, [
      seatId,
      trip[0].trip_id,
      req.session.userId,
    ]);

    if (bookingRows.length === 0) {
      throw new Error("Error updating booking!");
    }

    await client.query("COMMIT");
    return res.status(200).json({ booking: bookingRows, seat: seat });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  }
};

export { getSeats, getBusSeats, checkIn };
