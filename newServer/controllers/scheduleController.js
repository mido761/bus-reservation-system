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
  const { busIds, routeIds, departureDate, departureTime, arrivalTime } =
    req.body;

  try {
    if (
      !routeIds?.length ||
      !departureDate ||
      !departureTime ||
      !arrivalTime
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Combine date & times into full Date objects
    const departureDateTime = new Date(`${departureDate}T${departureTime}:00Z`);
    const arrivalDateTime = new Date(`${departureDate}T${arrivalTime}:00Z`);

    // Check for existing schedule at the same departure/arrival times
    const existingSchedules = await Schedule.find({
      departure: departureDateTime,
      arrival: arrivalDateTime,
    });

    if (existingSchedules.length > 0) {
      return res
        .status(400)
        .json({ message: "A trip is already scheduled at the same time!" });
    }

    // Create & save the new schedule
    const newSchedule = new Schedule({
      busIds: busIds, // Assuming Schedule schema allows array or multiple
      routeIds: routeIds, // Same here
      departure: departureDateTime,
      arrival: arrivalDateTime,
    });

    await newSchedule.save();

    return res.status(200).json({ message: "Schedule added successfully!" });
  } catch (error) {
    console.error("Error adding schedule:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = { getSchedules, addSchedule };
