import pool from "../db.js";

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

const getTrip = async (req, res) => {
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

const addTrip = async (req, res) => {
  const { routeId, departureDate, departureTime, arrivalTime } = req.body;

  try {
    if (!routeId || !departureDate || !departureTime || !arrivalTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log(routeId, departureDate, departureTime, arrivalTime);

    // Convert date to ISO format (YYYY-MM-DD)
    const formattedDate = new Date(departureDate).toISOString().split("T")[0];

    // Check if trip already exists
    const checkTrip = `
      SELECT * 
      FROM trips
      WHERE (route_id, date, departure_time) = ($1, $2, $3)
    `;
    const { rows } = await pool.query(checkTrip, [
      routeId,
      formattedDate,
      departureTime,
    ]);
    const trip = rows[0];

    if (trip) {
      return res
        .status(400)
        .json({ message: "A trip is already scheduled at the same time!" });
    }

    // Insert new trip
    const addTrip = `
      INSERT INTO trips(
        route_id, date, departure_time, arrival_time
      )
      VALUES ($1, $2, $3, $4)
      RETURNING trip_id, date, departure_time, arrival_time
    `;
    const { rows: newTrip } = await pool.query(addTrip, [
      routeId,
      formattedDate,
      departureTime,
      arrivalTime,
    ]);

    return res
      .status(200)
      .json({ message: "Trip added successfully!", trip: newTrip[0] });
  } catch (error) {
    console.error("Error adding schedule:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

const linkTripBus = async (req, res) => {
  try {
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editTrip = async (req, res) => {
  try {
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const delTrip = async (req, res) => {
  const {tripId} = req.body
  try {
    const checkTrip = `
      SELECT * 
      FROM trips
      WHERE trip_id= $1
    `;
    const { rows } = await pool.query(checkTrip, [
      tripId
    ]);
    const trip = rows[0];

    if (!trip) {
      return res
        .status(400)
        .json({ message: "This trip doesn't exist!" });
    }

    const delTripQuery = `
    DELETE FROM trips
    WHERE trip_id = $1
    RETURNING *
    `

    const {rows: deletedTrip} = await pool.query(delTripQuery, [tripId]);

    return res.status(200).json({message: "Trip deleted susccessfully!", deleted_trip: deletedTrip});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { getTrips, getTrip, addTrip, linkTripBus, editTrip, delTrip };
