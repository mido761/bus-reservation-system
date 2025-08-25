import pool from "../db.js";

const getRoutes = async (req, res) => {
  try {
    const getRoutes = `
    SELECT * FROM route;
    `;

    const { rows } = await pool.query(getRoutes);
    const routes = rows;

    return res.status(200).json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRoutesWithStops = async (req, res) => {
  try {
    const getRoutesWithStops = `
    SELECT 
    r.route_id,
    r.source,
    r.destination,
    rs.stop_id,
    rs.position,
    s.stop_name,
    s.location,
    s.distance_from_source,
    s.is_active
    FROM route r
    LEFT JOIN route_stop rs ON r.route_id = rs.route_id
    LEFT JOIN stop s ON rs.stop_id = s.stop_id
    ORDER BY r.route_id, rs.position;
    `;

    const { rows } = await pool.query(getRoutesWithStops);

    const routesWithStops = rows;

    return res.status(200).json({ routes: routesWithStops });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRouteStops = async (req, res) => {
  const routeId = req.params.routeId;
  try {
    const getRouteStops = `
    SELECT rs.stop_id, rs.position, s.stop_name, s.location, s.distance_from_source, s.is_active
    FROM route_stop rs
    INNER JOIN stop s ON rs.stop_id = s.stop_id
    WHERE rs.route_id = $1
    ORDER BY rs.position
    `;

    const { rows } = await pool.query(getRouteStops, [routeId]);

    const stops = rows[0];

    return res.status(200).json({ stops: stops });
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
  const { routeId, stopId, position } = req.body;
  try {
    const link = `
    INSERT INTO route_stop (route_id, stop_id, position) 
    VALUES ($1, $2, $3)
    RETURNING *
    `;

    const { rows } = await pool.query(link, [routeId, stopId, position]);
    const route_stop = rows;
    console.log(rows);

    return res.status(200).json({ newLink: route_stop });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editRoutes = (req, res) => {};

const delRoutes = async (req, res) => {
  const { routeId } = req.body;
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

export { getRoutes, getRoutesWithStops, getRouteStops, addRoutes, linkStop, editRoutes, delRoutes };
