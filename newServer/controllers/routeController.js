import Route from "../models/route.js";
import Stop from "../models/stop.js";
import pool from "../db.js";

const getRoutes = async (req, res) => {
  try {
    const getRoutes = `
    SELECT * FROM route;
    `;

    const { rows } = await pool.query(getRoutes);
    const routes = rows[0];

    return res.status(200).json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addRoutes = async (req, res) => {
  const { source, destination, distance, estimatedDuration, isActive } =
    req.body;
  try {
    if (!(source && destination && distance && estimatedDuration)) {
      return res
        .status(400)
        .json(
          "You should fill source & destination & distance & estimatedDuration & stops!"
        );
    }

    const checkRoute = `
        SELECT * FROM route WHERE source = $1 AND destination = $2
        `;
    const routeRes = await pool.query(checkRoute, [source, destination]);
    const route = routeRes.rows[0];

    if (route) {
      return res.status(400).json("This route aleardy exists!");
    }

    const insertRoute = `
        INSERT INTO route (source, destination, distance, estimated_duration, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `;

    const insertRes = await pool.query(insertRoute, [
      source,
      destination,
      distance,
      estimatedDuration,
      isActive,
    ]);
    const newRoute = insertRes.rows[0];
    console.log(newRoute);

    return res
      .status(200)
      .json({ message: `Route added successfully!`, route: newRoute });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const linkStop = async (req, res) => {
  const {routeId, stopId, position} = req.body
  try {
    const link = `
    INSERT INTO route_stop (routeId, stopId, position) VALUES ($1, $2, $3)
    `;

    const { rows: rsRows } = await pool.query(link, [routeId, stopId, position]);
    const route_stop = rsRows[0];

    return res.status(200).json(route_stop);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



const editRoutes = (req, res) => {};

const delRoutes = async (req, res) => {
  const {routeId} = req.body;
  try {
    const checkRouteById = `
      SELECT * FROM route WHERE route_id = $1
    `;

    const routeRes = await pool.query(checkRouteById, [routeId]);
    const route = routeRes.rows[0];

    if (!route) {
      return res.status(400).json("This route is not found!");
    }

    const delRoute = `
      DELETE FROM route
      WHERE route_id = $1;
    `;

    const { rows } = await pool.query(delRoute, [routeId]);
    const deletedRoute = rows[0];

    return res
      .status(200)
      .json({ message: "Route deleted Successfully", deletedRoute });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { getRoutes, addRoutes, linkStop, editRoutes, delRoutes };
