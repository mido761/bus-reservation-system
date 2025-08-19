import Stop from "../models/stop.js";
import pool from "../db.js"

const getStops = async (req, res) => {
  try {
    const getquery = 'select * from stop'
    const {row} = await pool.query(getquery);
    const stops = row
    return res.status(200).json(stops);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const addStop = async (req, res) => {
  const {stopName,location,distanceFromSource} = req.body;
  try{
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
  }catch(error){
    return res.status(500).json({ message: error.message });
  }
};
const editStop = async (req, res) => {
//dont know
};

const delStop = async (req, res) => {
const { stopId } = req.body;
try {
  // 1. Check if stop exists
  const checkQuery = 'SELECT * FROM stop WHERE stop_id = $1 LIMIT 1';
  const checkResult = await pool.query(checkQuery, [stopId]);

  if (checkResult.rows.length === 0) {
    return res.status(404).json("Stop not found!");
  }

  // 2. Delete stop
  const deleteQuery = 'DELETE FROM stop WHERE stop_Id = $1 RETURNING *';
  const deleteResult = await pool.query(deleteQuery, [stopId]);

  const deletedStop = deleteResult.rows[0];

  return res.status(200).json({
    message: "Stop deleted successfully!",
    stop: deletedStop,
  });
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: error.message });
}

};

export { getStops, addStop, editStop, delStop };
