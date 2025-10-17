import pool from "../db.js"

const getStops = async (req, res) => {
  try {
    const getquery = 'select * from stop where stop.is_active = $1'
    const { rows } = await pool.query(getquery, [true]);
    const stops = rows
    return res.status(200).json(stops);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStopsRoute = async (req, res) => {
  const routeId = req.params.routeId
  try {
    const getRouteStops = `
    SELECT rs.stop_id, rs.position, s.stop_name, s.location, s.distance_from_source, s.is_active
    FROM route_stop rs
    INNER JOIN stop s ON rs.stop_id = s.stop_id
    WHERE rs.route_id = $1
    ORDER BY rs.position
    `;

    const { rows } = await pool.query(getRouteStops, [routeId]);

    const stops = rows;

    return res.status(200).json({ stops: stops });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

}


const addStop = async (req, res) => {
  const { stopName, location, distanceFromSource } = req.body;
  try {
    const checkQuery = 'SELECT * FROM stop WHERE stop_name = $1 LIMIT 1';
    const checkResult = await pool.query(checkQuery, [stopName]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json("This Stop Name already exists!!");
    }


    const insertQuery = `
      INSERT INTO stop (stop_name, location, distance_from_source)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [stopName, location, distanceFromSource]);

    const newStop = insertResult.rows[0];
    return res.status(200).json("Stop added successfully!");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const editStop = async (req, res) => {
  const { stopId } = req.params;
  const {
    stopName,
    location,
    distanceFromSource,
  } = req.body;

  try {
    const checkStop = `
      SELECT * 
      FROM stop
      WHERE stop_id= $1
    `;
    const stop = await pool.query(checkStop, [stopId]);
    const stopRes = stop.rows[0];

    if (stop.rowCount === 0) {
      return res.status(400).json({ message: "This stop doesn't exist!" });
    }

    const updateQuery = `
      UPDATE stop
      SET 
        stop_name = COALESCE($1, stop_name),
        location = COALESCE($2, location),
        distance_from_source = COALESCE($3, distance_from_source)
      WHERE stop_id = $4
      RETURNING *;
    `;

    const values = [
      stopName,
      location,
      distanceFromSource,
      stopId
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Error updating stop!" });
    }

    res.json({
      message: "Stop updated successfully",
      trip: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error editing stop!", error: err.message });
  }
};

const delStop = async (req, res) => {
  const { stopId } = req.body;
  try {
    console.log(stopId)
    // 1. Check if stop exists
    const checkQuery = 'SELECT * FROM stop WHERE stop_id = $1 LIMIT 1';
    const checkResult = await pool.query(checkQuery, [stopId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json("Stop not found!");
    }

    // 2. Mark stop as inactive
    const deactivateQuery = 'UPDATE stop SET is_active = false WHERE stop_Id = $1 RETURNING *';
    const deactivateResult = await pool.query(deactivateQuery, [stopId]);

    const deactivatedStop = deactivateResult.rows[0];

    return res.status(200).json({
      message: "Stop deleted successfully!",
      stop: deactivatedStop,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }

};

export { getStops, addStop, editStop, delStop, getStopsRoute };
