import pool from "../db.js";
import pg from "pg";
const types = pg.types;

// OID 1082 is DATE in Postgres
types.setTypeParser(1082, (val) => val);

const getTrips = async (req, res) => {
  try {
    const getTrips = `
    SELECT * FROM trips
    `;

    const { rows: trips } = await pool.query(getTrips);

    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const getTripsWithPassengerCounts = async (req, res) => {
  try {
    const getTripsWithCounts = `
    SELECT 
      t.*,
      r.source,
      r.destination,
      COALESCE(passenger_counts.total_passengers, 0) as total_passengers
    FROM trips t
    LEFT JOIN route r ON t.route_id = r.route_id
    LEFT JOIN (
      SELECT 
        trip_id,
        COUNT(*) as total_passengers
      FROM booking b
      WHERE b.status IN ('confirmed', 'waiting')
      GROUP BY trip_id
    ) passenger_counts ON t.trip_id = passenger_counts.trip_id
    ORDER BY t.date DESC, t.departure_time ASC
    `;

    const { rows: trips } = await pool.query(getTripsWithCounts);
    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const getUserTrips = async (req, res) => {
  try {
    const getUserTrips = `
  SELECT DISTINCT
    trips.trip_id,
    trips.date,
    trips.departure_time,
    trips.arrival_time,
    trips.status,
    trips.price,
    route.source,
    route.destination,
    route.distance,
    route.estimated_duration
  FROM trips
  JOIN booking 
    ON trips.trip_id = booking.trip_id
  LEFT JOIN route 
    ON trips.route_id = route.route_id
  LEFT JOIN stop 
    ON booking.stop_id = stop.stop_id
  WHERE booking.passenger_id = $1
  ORDER BY trips.date DESC, trips.departure_time ASC
`;

    const { rows: trips } = await pool.query(getUserTrips, [
      req.session.userId,
    ]);

    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTrip = async (req, res) => {
  const { routeId, date } = req.body;
  try {
    // Validate inputs first
    if (!routeId || !date) {
      return res.status(400).json({ message: "routeId and date are required" });
    }

    const getTrips = `
      SELECT *
      FROM trips t
      JOIN route r
        ON t.route_id = r.route_id 
      WHERE t.route_id = $1 AND t.date = $2;
    `;

    // Format date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split("T")[0];

    const { rows: trip } = await pool.query(getTrips, [routeId, formattedDate]);
    // const formattedDate2 = new Date(trip.date).toISOString().split("T")[0];
    // => "2025-08-22"

    // Handle empty result
    if (trip.length === 0) {
      return res
        .status(404)
        .json({ message: "No trips found for this route and date" });
    }

    return res
      .status(200)
      .json({ message: "Trip found successfully!", data: trip });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addTrip = async (req, res) => {
  const { routeId, date, departureTime, arrivalTime, price, min_cap } = req.body;

  try {
    if (!routeId || !date || !departureTime || !arrivalTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log(routeId, date, departureTime, arrivalTime);

    // Convert date to ISO format (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split("T")[0];

    const query = `
      INSERT INTO trips (route_id, date, departure_time, arrival_time, price, min_bus_cap)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (route_id, date, departure_time) DO NOTHING
      RETURNING *;
    `;

    const values = [routeId, formattedDate, departureTime, arrivalTime, price, min_cap];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      // conflict happened → trip already exists
      return res.status(409).json({ message: "Trip already exists" });
    }

    return res.status(201).json({
      message: "Trip added successfully",
      trip: result.rows[0],
    });
  } catch (err) {
    console.error("Error inserting trip:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const linkTripBus = async (req, res) => {
  const { busId, tripId } = req.body;
  try {
    const TripCheckQ = `
      SELECT trip_id
      FROM trips
      WHERE trip_id = $1
      LIMIT 1
    `;
    const trip = await pool.query(TripCheckQ, [tripId]);

    if (!trip.rowCount)
      return res.status(404).json({ message: "Trip not found!" });

    const BusCheckQ = `
      SELECT bus_id
      FROM bus
      WHERE bus_id = $1
      LIMIT 1
    `;

    const bus = await pool.query(BusCheckQ, [busId]);

    if (!bus.rowCount)
      return res.status(404).json({ message: "Trip not found!" });

    const linkTripBusQ = `
      INSERT 
      INTO trip_bus (trip_id, bus_id)
      VALUES ($1, $2)
    `;
    const { rows: linkRows } = await pool.query(linkTripBusQ, [tripId, busId]);
    if (!linkRows) throw new Error("Failed to link Bus to trip!");

    return res.status(200).json({
      message: `Trip: ${trip.rows[0].trip_id} successfully linked to Bus: ${bus.rows[0].bus_id}`,
    });
  } catch (err) {
    console.error("Error linking: ", err);
    return res.status(500).json({ message: err.message });
  }
};
``;

const editTrip = async (req, res) => {
  const { tripId } = req.params;
  const {
    routeId,
    date,
    departureTime,
    arrivalTime,
    price,
    status,
    minBusCap,
    confirmLock,
  } = req.body;

  try {
    const checkTrip = `
      SELECT * 
      FROM trips
      WHERE trip_id= $1
    `;
    const { rows } = await pool.query(checkTrip, [tripId]);
    const trip = rows[0];

    if (!trip) {
      return res.status(400).json({ message: "This trip doesn't exist!" });
    }

    const updateQuery = `
      UPDATE trips
      SET 
        route_id = COALESCE($1, route_id),
        date = COALESCE($2, date),
        departure_time = COALESCE($3, departure_time),
        arrival_time = COALESCE($4, arrival_time),
        price = COALESCE($5, price),
        status = COALESCE($6, status),
        min_bus_cap = COALESCE($7, min_bus_cap),
        confirm_lock = COALESCE($8, confirm_lock)
      WHERE trip_id = $9
      RETURNING *;
    `;

    const values = [
      routeId,
      date,
      departureTime,
      arrivalTime,
      price,
      status,
      minBusCap,
      confirmLock,
      tripId,
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json({
      message: "Bus updated successfully",
      trip: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message:"error editing trip", err:error.message });
  }
};

const completeTrip = async (req, res) => {
  const { tripId } = req.body;
  try {
    const checkTrip = `
      SELECT * 
      FROM trips
      WHERE trip_id= $1
    `;
    const { rows } = await pool.query(checkTrip, [tripId]);
    const trip = rows[0];

    if (!trip) {
      return res.status(400).json({ message: "This trip doesn't exist!" });
    }

    const completeTripQuery = `
    update trips
    SET status = 'completed'
    WHERE trip_id = $1
    RETURNING *
    `;

    const { rows: completedTrip } = await pool.query(completeTripQuery, [tripId]);

    return res.status(200).json({
      message: "Trip canceled susccessfully!",
      completed_trip: completedTrip,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const cancelTrip = async (req, res) => {
  const { tripId } = req.body;
  try {
    const checkTrip = `
      SELECT * 
      FROM trips
      WHERE trip_id= $1
    `;
    const { rows } = await pool.query(checkTrip, [tripId]);
    const trip = rows[0];

    if (!trip) {
      return res.status(400).json({ message: "This trip doesn't exist!" });
    }

    const cancelTripQuery = `
    update trips
    SET status = 'canceled'
    WHERE trip_id = $1
    RETURNING *
    `;

    const { rows: canceledTrip } = await pool.query(cancelTripQuery, [tripId]);

    return res.status(200).json({
      message: "Trip canceled susccessfully!",
      canceled_trip: canceledTrip,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const confirmTrip = async (req, res) => {
  try {
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// const cancelTrip = async (req, res) => {
//   const { tripId } = req.body;
//   try {
//     const checkTrip = `
//       SELECT * 
//       FROM trips
//       WHERE trip_id= $1
//     `;
//     const { rowCount: tripsCount } = await pool.query(checkTrip, [tripId]);
//     // const trip = rows[0];

//     if (tripsCount === 0) {
//       return res.status(400).json({ message: "This trip doesn't exist!" });
//     }

//     const cancelTripQuery = `
//     UPDATE trips
//     SET trip.status = $2
//     WHERE trip_id = $1
//     RETURNING *
//     `;

//     const { rows: cancelledTrip } = await pool.query(cancelTripQuery, [tripId, "cancelled"]);

//     return res.status(200).json({
//       message: "Trip cancelled susccessfully!",
//       cancelled_trip: cancelledTrip,
//     });
//   } catch (error) {
//     console.error("Error cancelling trip: ", error.response.data.message)
//     return res.status(500).json({ message: error.message });
//   }
// };

const delTrip = async (req, res) => {
  const { tripId } = req.body;
  try {
    const checkTrip = `
      SELECT * 
      FROM trips
      WHERE trip_id= $1
    `;
    const { rows } = await pool.query(checkTrip, [tripId]);
    const trip = rows[0];

    if (!trip) {
      return res.status(400).json({ message: "This trip doesn't exist!" });
    }

    const delTripQuery = `
    DELETE FROM trips
    WHERE trip_id = $1
    RETURNING *
    `;

    const { rows: deletedTrip } = await pool.query(delTripQuery, [tripId]);

    return res.status(200).json({
      message: "Trip deleted susccessfully!",
      deleted_trip: deletedTrip,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export {
  getTrips,
  getTripsWithPassengerCounts,
  getUserTrips,
  getTrip,
  addTrip,
  linkTripBus,
  editTrip,
  completeTrip,
  cancelTrip,
  delTrip,
};
