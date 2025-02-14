import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddBus.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const locations = [
  "Borg Al-Arab",
  "Cairo",
  "Alexandria",
  "Sharm El-Sheikh",
  "Aswan",
];

const AddBus = () => {
  const [totalSeats, setAllSeats] = useState("");
  const [schedule, setSchedule] = useState("");
  const [minNoPassengers, setMinNoPassengers] = useState("");
  const [price, setPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [cancelTimeAllowance, setCancelTimeAllowance] = useState("");
  const [bookingTimeAllowance, setBookingTimeAllowance] = useState("");
  const [allowedNumberOfBags, setAllowedNumberOfBags] = useState("");
  const [next, setNext] = useState(false);
  const [errors, setErrors] = useState({});

  // Get today's date in YYYY-MM-DD format to set as the minimum date
  const today = new Date().toISOString().split("T")[0];

  // Time validation regex for 12-hour clock with AM/PM
  const validateTime = (time) => {
    const regex = /^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;
    return regex.test(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let formErrors = {};
    let valid = true;

    // Validate time inputs
    if (!validateTime(departureTime)) {
      formErrors.departureTime =
        "Please enter a valid departure time (e.g., 03:00 PM).";
      valid = false;
    }

    if (!validateTime(arrivalTime)) {
      formErrors.arrivalTime =
        "Please enter a valid arrival time (e.g., 05:00 AM).";
      valid = false;
    }

    if (!valid) {
      setErrors(formErrors);
      return;
    }

    try {
      await axios.post(`${backEndUrl}/buses`, {
        totalSeats,
        schedule,
        minNoPassengers,
        price,
        pickupLocation,
        arrivalLocation,
        departureTime,
        arrivalTime,
        cancelTimeAllowance,
        bookingTimeAllowance,
        allowedNumberOfBags,
      });
      alert("Bus added successfully");
    } catch (err) {
      alert(err.response.data.message);
      console.log(err);
    }
  };

  return (
    <div className="add-bus-page">
      <form onSubmit={handleSubmit} className="add-bus">
        <h1>Add a new Bus</h1>
        {!next ? (
          <div>
            <label htmlFor="">Pickup location</label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            >
              <option value="">Select Pickup Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <label htmlFor="">Arrival location</label>
            <select
              value={arrivalLocation}
              onChange={(e) => setArrivalLocation(e.target.value)}
            >
              <option value="">Select Arrival Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <label>Departure time</label>
            <input
              type="text"
              placeholder="e.g., 03:00 PM"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />
            {errors.departureTime && (
              <p className="error">{errors.departureTime}</p>
            )}

            <label>Arrival time</label>
            <input
              type="text"
              placeholder="e.g., 05:00 AM"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />
            {errors.arrivalTime && (
              <p className="error">{errors.arrivalTime}</p>
            )}

            <label htmlFor="">Price</label>
            <input
              type="number"
              placeholder="Trip Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <label htmlFor="">Min No. passengers</label>
            <input
              type="number"
              placeholder="Minimium Number of passengers"
              value={minNoPassengers}
              onChange={(e) => setMinNoPassengers(e.target.value)}
            />
            <div className="next-btn" onClick={() => setNext(true)}>
              →
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="">Allowed Number Of Bags</label>
            <input
              type="number"
              placeholder="Allowed Number Of Bags"
              value={allowedNumberOfBags}
              onChange={(e) => setAllowedNumberOfBags(e.target.value)}
            />

            <label htmlFor="">Booking Time Allowance</label>
            <input
              type="number"
              placeholder="Booking Time Allowance"
              value={bookingTimeAllowance}
              onChange={(e) => setBookingTimeAllowance(e.target.value)}
            />

            <label htmlFor="">Cancel Time Allowance</label>
            <input
              type="number"
              placeholder="Cancel Time Allowance"
              value={cancelTimeAllowance}
              onChange={(e) => setCancelTimeAllowance(e.target.value)}
            />

            <label htmlFor="">Total Seats</label>
            <input
              type="number"
              placeholder="Total Number of Seats"
              value={totalSeats}
              onChange={(e) => setAllSeats(e.target.value)}
            />

            <label htmlFor="">Schedule</label>
            <input
              type="date"
              placeholder="Schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
            <div className="form-navigation">
              <div className="back-btn" onClick={() => setNext(false)}>
                ←
              </div>
              <button type="submit">Add Bus</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddBus;
