import React, { useState } from "react";
import axios from "axios";
import "./AddBus.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const locations = ["Cairo", "E-JUST"];

const AddBus = () => {
  const [busType, setBusType] = useState("form");
  const [totalSeats, setAllSeats] = useState(15);
  const [busNumber, setbusNumber] = useState("");
  const [schedule, setSchedule] = useState("");
  const [price, setPrice] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [cancelTimeAllowance, setCancelTimeAllowance] = useState("");
  const [bookingTimeAllowance, setBookingTimeAllowance] = useState("");
  const [allowedNumberOfBags, setAllowedNumberOfBags] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleQuickAdd = () => {
    setAllSeats(15);
    setbusNumber("1234");
    setPrice(0);
    setPickupLocation("E-JUST");
    setArrivalLocation("Cairo");
    setCancelTimeAllowance(3);
    setBookingTimeAllowance(1);
    setAllowedNumberOfBags(2);
    setSchedule(today);
    setDepartureTime("16:00");
    setArrivalTime("21:00");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(busType)
      if (busType === "seat") {
        console.log(busType)
        await axios.post(`${backEndUrl}/buses/`, {
          totalSeats,
          busNumber,
          schedule,
          price,
          pickupLocation,
          arrivalLocation,
          arrivalTime,
          departureTime,
          cancelTimeAllowance,
          bookingTimeAllowance
        });
      } else {
        await axios.post(`${backEndUrl}/form/add-form`, {
          totalSeats,
          busNumber,
          schedule,
          price,
          pickupLocation,
          arrivalLocation,
          departureTime,
          cancelTimeAllowance,
          bookingTimeAllowance
        });
      }

      setAlertMessage("Bus added successfully");
      setAlertFlag(true);
    } catch (err) {
      setAlertMessage(err?.response?.data?.message || "Something went wrong");
      setAlertFlag(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAlertFlag(false), 2200);
    }
  };

  return (
    <div className="add-bus-page">
      <form onSubmit={handleSubmit} className="add-bus">
        <h1>Add a new Bus</h1>

        {/* <label>Bus Type</label> */}
        <div className="bus-type-selection improved-ui">
          {/* <label className={busType === "seat" ? "selected" : ""}>
            <input
              type="radio"
              value="seat"
              checked={busType === "seat"}
              onChange={(e) => setBusType(e.target.value)}
            />
            Seat-based
          </label> */}
          <label className={busType === "form" ? "selected" : ""}>
            <input
              type="radio"
              value="form"
              checked={busType === "form"}
              onChange={(e) => setBusType(e.target.value)}
            />
            Form-based
          </label>
        </div>

        <div className="location">
          <div className="location-section">
            <label>Pickup location</label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            >
              <option value="">Pickup Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className="location-section">
            <label>Arrival location</label>
            <select
              value={arrivalLocation}
              onChange={(e) => setArrivalLocation(e.target.value)}
            >
              <option value="">Arrival Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label>Schedule</label>
        <input
          type="date"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        />

        {busType === "seat" && (
          <>
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </>
        )}


        <label>Departure Time</label>
        <input
          type="time"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
        />

        {busType === "seat" ? (
          <>
            <label>Arrival Time</label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />
            <label>Total Seats</label>
            <input
              type="number"
              value={totalSeats}
              onChange={(e) => setAllSeats(e.target.value)}
            />
            <label>Allowed Number Of Bags</label>
            <input
              type="number"
              value={allowedNumberOfBags}
              onChange={(e) => setAllowedNumberOfBags(e.target.value)}
            />
          </>
        ) : null}

        <label>Cancel Time Allowance</label>
        <input
          type="number"
          value={cancelTimeAllowance}
          onChange={(e) => setCancelTimeAllowance(e.target.value)}
        />

        <label>Booking Time Allowance</label>
        <input
          type="number"
          value={bookingTimeAllowance}
          onChange={(e) => setBookingTimeAllowance(e.target.value)}
        />

        <div className="form-navigation">
          <button type="button" id="quick-add-btn" onClick={handleQuickAdd}>
            Quick Add
          </button>
          <button type="submit" className="add-bus-btn">
            Add Bus
          </button>
        </div>
      </form>
      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </div>
  );
};

export default AddBus;
