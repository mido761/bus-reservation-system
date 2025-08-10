const Route = require("../models/route");

const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();

    return res.status(200).json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getRoutes };
