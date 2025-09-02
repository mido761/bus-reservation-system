// Helper: Get checked in booking
async function getCheckedInBooking(client, seatId) {
  const alreadyCheckedInTestQ = `
      SELECT booking_id, passenger_id
      FROM booking
      WHERE seat_id = $1 AND status = 'checked_in'
      LIMIT 1
    `;

  const { rows } = await client.query(alreadyCheckedInTestQ, [seatId]);
  return rows ? rows[0] : false;
}

// Helper: Get active trip for a bus
async function getActiveTrip(client, busId) {
  const getTripIdQ = `
    SELECT trip_bus.trip_id, trips.date, trips.departure_time
    FROM trip_bus
    JOIN trips ON trips.trip_id = trip_bus.trip_id
    WHERE bus_id = $1
      AND (trips.date + trips.departure_time) >= NOW() - interval '12 hour'
      AND (trips.date + trips.departure_time) <= (NOW() + interval '12 hour')
    LIMIT 1
  `;
  const { rows } = await client.query(getTripIdQ, [busId]);
  return rows;
}

// Helper: Count bookings for user on trip
async function getBookingCount(client, tripId, userId) {
  const bookingCountQ = `
    SELECT COUNT(*) AS booking_count
    FROM booking
    WHERE trip_id = $1 AND passenger_id = $2
  `;
  const { rows } = await client.query(bookingCountQ, [tripId, userId]);
  return parseInt(rows[0].booking_count, 10);
}

// Helper: Count checked-in seats for user on trip
async function getCheckedInCount(client, tripId, userId) {
  const checkedInCountQ = `
    SELECT COUNT(*) AS checked_in_count
    FROM booking
    WHERE trip_id = $1 AND passenger_id = $2 AND status = 'checked_in'
  `;
  const { rows } = await client.query(checkedInCountQ, [tripId, userId]);
  return parseInt(rows[0].checked_in_count, 10);
}

// Helper: Update booking and seat status
async function updateBookingStatus(
  client,
  seatId,
  tripId,
  userId,
  seatStatus,
  bookingStatus
) {
  const updateSeatQ = `
    UPDATE seat 
    SET status = $1
    WHERE seat_id = $2
    RETURNING seat_number, status, bus_id
  `;
  const { rows: seatRows } = await client.query(updateSeatQ, [
    seatStatus,
    seatId,
  ]);
  if (seatRows.length === 0) throw new Error("Seat not found");

  const updateBookingQ = `
    UPDATE booking 
    SET seat_id = $1, status = $2
    WHERE trip_id = $3 AND passenger_id = $4
    RETURNING booking_id, passenger_id, trip_id, seat_id, status
  `;
  const { rows: bookingRows } = await client.query(updateBookingQ, [
    seatId,
    bookingStatus,
    tripId,
    userId,
  ]);
  if (bookingRows.length === 0) throw new Error("Error updating booking!");

  return { seat: seatRows[0], booking: bookingRows[0] };
}

export {
  getCheckedInBooking,
  getActiveTrip,
  getBookingCount,
  getCheckedInCount,
  updateBookingStatus,
};
