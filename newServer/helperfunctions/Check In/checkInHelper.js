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

// Helper: Get booking
async function getBooking(client, seatId) {
  const alreadyCheckedInTestQ = `
      SELECT booking_id, passenger_id, status
      FROM booking
      WHERE seat_id = $1
      LIMIT 1
    `;

  const { rows } = await client.query(alreadyCheckedInTestQ, [seatId]);
  return rows ? rows[0] : false;
}

// Helper: Get Seat
async function getSeat(client, seatId) {
  const alreadyCheckedInTestQ = `
      SELECT seat_id, status
      FROM seat
      WHERE seat_id = $1
      LIMIT 1
    `;

  const { rows } = await client.query(alreadyCheckedInTestQ, [seatId]);
  return rows ? rows[0] : [];
}

// Helper: Get active trip for a bus
async function getActiveTrip(client, busId) {
  const getTripIdQ = `
    SELECT trip_bus.trip_id, trips.date, trips.departure_time
    FROM trip_bus
    JOIN trips ON trips.trip_id = trip_bus.trip_id
    WHERE bus_id = $1  -- Replace $1 with the bus ID parameter
      AND (trips.date + trips.departure_time) BETWEEN NOW() - interval '30 minutes' AND NOW() + interval '30 minutes'
    ORDER BY (trips.date + trips.departure_time) ASC  -- Sort by nearest time
    LIMIT 1;  -- Only return one trip
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
  cancel,
  seatId,
  tripId,
  userId,
  seatStatus,
  bookingStatus,
  currentSeatStatus,
  currentBookingStatus
) {
  const updateSeatQ = `
    UPDATE seat 
    SET status = $1
    WHERE seat_id = $2 AND status = $3
    RETURNING seat_number, status, bus_id
  `;
  const { rows: seatRows } = await client.query(updateSeatQ, [
    seatStatus,
    seatId,
    currentSeatStatus,
  ]);
  if (seatRows.length === 0) throw new Error("Seat not found");

  const updateBookingQ = `
    UPDATE booking 
    SET seat_id = $1, status = $2
    WHERE trip_id = $3 AND passenger_id = $4 AND status = $5
    RETURNING booking_id, passenger_id, trip_id, seat_id, status
  `;
  const { rows: bookingRows } = await client.query(updateBookingQ, [
    cancel ? null : seatId,
    bookingStatus,
    tripId,
    userId,
    currentBookingStatus,
  ]);
  if (bookingRows.length === 0) throw new Error(`Error updating booking!}`);

  return { seat: seatRows[0], booking: bookingRows[0] };
}

export {
  getCheckedInBooking,
  getBooking,
  getSeat,
  getActiveTrip,
  getBookingCount,
  getCheckedInCount,
  updateBookingStatus,
};
