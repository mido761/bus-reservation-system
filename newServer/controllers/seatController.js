import pool from "../db.js";
import {
  getCheckedInBooking,
  getActiveTrip,
  getBookingCount,
  getCheckedInCount,
  updateBookingStatus,
} from "../helperfunctions/Check In/checkInHelper.js";

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

    if (busSeats.length === 0) {
      return res.status(400).json({ message: "No seats found for this bus!" });
    }
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

    // Check if the seat is already checked in
    const alreadyCheckedInBooking = await getCheckedInBooking(client, seatId);
    const currentPassenger = alreadyCheckedInBooking?.passenger_id;
    if (alreadyCheckedInBooking) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Seat already checked in!",
        passengerId: currentPassenger,
        currentUser: userId,
      });
    }

    // Get the trip of the current Bus
    const trip = await getActiveTrip(client, busId);
    console.log(trip);
    if (trip.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "This bus is not assigned to a trip in the given time window!",
      });
    }
    const tripId = trip[0].trip_id;

    // Count user's bookings for this trip
    const bookingCount = await getBookingCount(client, tripId, userId);
    console.log(bookingCount);

    // Count seats already checked in by this user for this trip
    const checkedInCount = await getCheckedInCount(client, tripId, userId);
    console.log(checkedInCount);

    // if (checkedInCount >= bookingCount) {
    //   await client.query("ROLLBACK");
    //   return res.status(400).json({
    //     message:
    //       "Exceeded number of allowed seats.",
    //   });
    // }

    // Update seat and booking status
    const updateBookingAndSeat = await updateBookingStatus(
      client,
      seatId,
      tripId,
      userId,
      "booked",
      "checked_in"
    );

    await client.query("COMMIT");
    return res.status(200).json({
      booking: updateBookingAndSeat.booking,
      seat: updateBookingAndSeat.seat,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const cancelCheckIn = async (req, res) => {
  const { busId, seatId } = req.body;
  const userId = req.session.userId;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if the seat is already checked in
    const alreadyCheckedInBooking = await getCheckedInBooking(client, seatId);
    const currentPassenger = alreadyCheckedInBooking?.passenger_id;
    console.log("Checked In: ", alreadyCheckedInBooking)
    if (!alreadyCheckedInBooking || alreadyCheckedInBooking.booking_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Seat is already Available!",
        passengerId: currentPassenger,
        currentUser: userId,
      });
    }

    if (currentPassenger !== userId) {
      return res.status(400).json({
        message: "Can't Cancel other's seats!",
        passengerId: currentPassenger,
        currentUser: userId,
      });
    }

    // Get the trip of the current Bus
    const trip = await getActiveTrip(client, busId);
    console.log(trip);
    if (trip.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "This bus is not assigned to a trip in the given time window!",
      });
    }
    const tripId = trip[0].trip_id;

    // Count user's bookings for this trip
    const bookingCount = await getBookingCount(client, tripId, userId);

    // Count seats already checked in by this user for this trip
    const checkedInCount = getCheckedInCount(client, tripId, userId);

    if (checkedInCount >= bookingCount) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message:
          "You cannot check in for more seats than you have bookings for this trip.",
      });
    }

    // Update seat and booking status
    const updateBookingAndSeat = await updateBookingStatus(
      client,
      seatId,
      tripId,
      userId,
      "Available",
      "not_checked_in"
    );

    await client.query("COMMIT");
    return res.status(200).json({
      booking: updateBookingAndSeat.booking,
      seat: updateBookingAndSeat.seat,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export { getSeats, getBusSeats, checkIn, cancelCheckIn };
