const Schedule = require("../models/schedule");
const bus = require("../models/bus");
const route = require("../models/route");

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find();

    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addSchedule = async (req, res) => {
  const { busId, routeId, departureDate, departureTime, arrivalTime } =
    req.body;
  try {
    const combinedDepartureISO = `${departureDate}T${departureTime}:00`; // "2025-08-10T23:22:00"
    const combinedArrivalISO = `${departureDate}T${arrivalTime}:00`; // "2025-08-10T23:22:00"

    // Convert to JS Date object
    const departureDateTime = new Date(combinedDepartureISO);
    const arrivalDateTime = new Date(combinedArrivalISO);

    console.log(departureTime, departureDate, arrivalTime)
    const schedules = await Schedule.find({
      departure: departureDateTime,
      arrival: arrivalDateTime,
    });

    console.log(schedules);
    if (schedules.length > 0) {
      return res
        .status(400)
        .json("A trip is already scheduled at the same time!");
    }


    // Save the new schedule in MongoDB
    const newSchedule = new Schedule({
      busId: busId,
      routeId: routeId,
      departure: departureDateTime,
      arrival: arrivalDateTime,
    });

    await newSchedule.save();

    return res.status(200).json("Schedule added successfully!");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getSchedules, addSchedule };
