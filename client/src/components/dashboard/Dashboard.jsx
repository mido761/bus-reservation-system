import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingComponent from "../loadingComponent/loadingComponent";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Dashboard = ({ busDetails, error, userId }) => {
  const navigate = useNavigate();
  // const [busesDetails, setBusesDetails] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const hasFetched = useRef(false); // Ref to track whether fetch has been performed


  // useEffect(() => {
  //   if (hasFetched.current) return; // Exit if the fetch has already been performed
  //   hasFetched.current = true; // Mark fetch as performed

  //   // fetchUsers(); // Fetch user and bus details only once
  // }, []);
 

  const handleBusSelect = (bus) => {
    navigate(`/seat-selection/${bus._id}`); //to get the bus id in the seat selection
  };

  // if (isLoading) {
  //   return <LoadingComponent/>;
  // }

  // if (error) {
  //   return <p>{error}</p>;
  // }
  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    let period = "AM";
    let hour12 = parseInt(hour, 10);

    if (hour12 >= 12) {
      period = "PM";
      if (hour12 > 12) hour12 -= 12;
    }
    if (hour12 === 0) hour12 = 12;

    return `${hour12}:${minute} ${period}`;
  };


  return (
    <>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-cards">
          {busDetails && busDetails.length > 0 ? (
            busDetails.map(
              (bus, index) =>
                bus !== null && (
                  <div
                    className="dashboard-card"
                    key={index}
                    onClick={() => handleBusSelect(bus)}
                  >
                    <p>
                      {bus.location.pickupLocation} to{" "}
                      {bus.location.arrivalLocation}
                    </p>
                    <p>{bus.schedule}</p>
                    <p>
                      {convertTo12HourFormat(bus.time.departureTime)}
                    </p>
                    <p>
                      {bus.seats.bookedSeats
                        .map((seat, index) =>
                          seat === userId ? index < 7
                        ? index - 1
                        : index > 7 && index < 10
                        ? index - 2
                        : index > 10 && index < 14
                        ? index - 3
                        : index - 4 : null
                        )
                        .filter((index) => index !== null)
                        .join(", ")}
                    </p>
                  </div>
                )
            )
          ) : (
            <p>No buses found.</p>
          )}

          <br />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
