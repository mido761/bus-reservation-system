import React, { useState } from "react";
import axios from "axios";
import "./AddBus.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const locations = ["Ramses", "Dandy", "E-JUST", "Abaseya"];

const AddBus = () => {
  const [totalSeats, setAllSeats] = useState(15);
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
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  // Get today's date in YYYY-MM-DD format to set as the minimum date
  const today = new Date().toISOString().split("T")[0];

  // Function to pre-fill form values
  const handleQuickAdd = () => {
    setAllSeats(15);
    setMinNoPassengers(11);
    setPrice(110);
    setPickupLocation("E-JUST");
    setArrivalLocation("Ramses");
    setCancelTimeAllowance(2);
    setBookingTimeAllowance(1);
    setAllowedNumberOfBags(2);
    setSchedule(today); // Keep this empty for manual entry
    setDepartureTime("16:00"); // Keep this empty for manual entry
    setArrivalTime("21:00"); // Keep this empty for manual entry
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    console.log(
      totalSeats,
      schedule,
      price,
      pickupLocation,
      arrivalLocation,
      arrivalTime,
      departureTime
    );
    e.preventDefault();
    try {
      setAllSeats(15);
      await axios.post(`${backEndUrl}/buses`, {
        totalSeats,
        schedule,
        price,
        pickupLocation,
        arrivalLocation,
        departureTime,
        arrivalTime,
      });

      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage("Bus added successfully");
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    } catch (err) {
      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage(err.response.data.message);
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };


  return (
    <div className="add-bus-page">
      <form onSubmit={handleSubmit} className="add-bus">
        <h1>Add a new Bus</h1>

        <div>
          <label>Pickup location</label>
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

          <label>Arrival location</label>
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
            type="time"
            placeholder="Leaving Time"
            value={(departureTime)}
            onChange={(e) => setDepartureTime((e.target.value))}
          />

          <label>Arrival time</label>
          <input
            type="time"
            placeholder="Arrival Time"
            value={(arrivalTime)}
            onChange={(e) => setArrivalTime((e.target.value))}
          />
          <label>Price</label>
          <input
            type=""
            placeholder="Trip Price"
            maxLength={"3"}
            max={10}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          {/* <label>Min No. passengers</label>
            <input type="number" placeholder="Minimum Number of passengers" value={minNoPassengers} onChange={(e) => setMinNoPassengers(e.target.value)} /> */}
          <label>Schedule</label>
          <input
            type="date"
            placeholder="Schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />

          <div className="form-buttons">
            {/* <div className="next-btn" onClick={() => setNext(true)}>
                →
              </div> */}
            <div className="form-navigation">
              <button type="button" id="quick-add-btn" onClick={handleQuickAdd}>
                Quick Add
              </button>
              <button type="submit" className="add-bus-btn">
                Add Bus
              </button>
            </div>
          </div>
        </div>

        {/* //   <div>
        //     <label>Allowed Number Of Bags</label>
        //     <input
        //       type="number"
        //       placeholder="Allowed Number Of Bags"
        //       value={allowedNumberOfBags}
        //       onChange={(e) => setAllowedNumberOfBags(e.target.value)}
        //     />

        //     <label>Booking Time Allowance</label>
        //     <input
        //       type="number"
        //       placeholder="Booking Time Allowance"
        //       value={bookingTimeAllowance}
        //       onChange={(e) => setBookingTimeAllowance(e.target.value)}
        //     />

        //     <label>Cancel Time Allowance</label>
        //     <input
        //       type="number"
        //       placeholder="Cancel Time Allowance"
        //       value={cancelTimeAllowance}
        //       onChange={(e) => setCancelTimeAllowance(e.target.value)}
        //     />

        //     <label>Total Seats</label>
        //     <input
        //       type="number"
        //       placeholder="Total Number of Seats"
        //       value={totalSeats}
        //       onChange={(e) => setAllSeats(e.target.value)}
        //     />

        //     <label>Schedule</label>
        //     <input
        //       type="date"
        //       placeholder="Schedule"
        //       value={schedule}
        //       onChange={(e) => setSchedule(e.target.value)}
        //     />

        //     <div className="form-navigation">
        //       <div className="back-btn" onClick={() => setNext(false)}>
        //         ←
        //       </div>
        //       <button type="submit">Add Bus</button>
        //     </div>
        //   </div> */}
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
