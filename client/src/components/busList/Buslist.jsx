import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Buslist.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BusList = () => {
  const [busList, setBusList] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [seatList, setSeatList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBusList = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/buses`);
      setBusList(response.data); // Assuming response data contains buses in "data"
    } catch (error) {
      console.error("Error fetching bus list:", error);
    }
  };

  // Fetch passengers for the selected bus
  const fetchPassengersForBus = async (busId) => {
    try {
      const response = await axios.get(`${backEndUrl}/seats/${busId}`);
      // Defensive check to make sure data is an array
      setSeatList(
        Array.isArray(response.data.data.seats) ? response.data.data.seats : []
      );
      setPassengers(
        Array.isArray(response.data.data.orderedUsers)
          ? response.data.data.orderedUsers
          : []
      );
      console.log("seatList: ", response.data.data.seats);
      console.log("usersList: ", response.data.data.orderedUsers);

      // let userlist = seatList.map(seat => seat.bookedBy);
      // console.log(userlist)
      // const response1 = await axios.post(`${backEndUrl}/seats/user`, { userList: userlist});
      // console.log(response1.data)
      // setPassengers(Array.isArray(response1.data.data) ? response1.data.data : []);
      // console.log(passengers)
    } catch (error) {
      console.error("Error fetching passengers for bus:", error);
      setSeatList([]); // Optional: Clear passengers on error
    }
  };

  // Handle selecting a bus
  const handleBusSelect = (busId) => {
    setSelectedBusId(busId === selectedBusId ? null : busId); // Toggle visibility
    if (busId !== selectedBusId) fetchPassengersForBus(busId);
  };

  useEffect(() => {
    fetchBusList();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPassengers = passengers.filter((passenger, idx) => {
    const query = searchQuery.toLowerCase();

    // Extract and prepare fields for comparison, making sure they are strings
    const userName = (passenger.name || "").toLowerCase();
    const phoneNumber = (String(passenger.phoneNumber) || "").toLowerCase(); // Ensure phoneNumber is treated as a string
    const route = (seatList[idx]?.route || "").toLowerCase(); // Fetch route from seatList, default to empty string if undefined

    // Check if any of the fields match the search query
    const matchesUserName = userName.includes(query);
    const matchesPhoneNumber = phoneNumber.includes(query);
    const matchesRoute = route.includes(query);

    // Return true if any of the conditions are true (OR logic)
    return matchesUserName || matchesPhoneNumber || matchesRoute;
  });

  // Calculate time difference
  const calculateTimeDifference = (reservedTime) => {
    const now = new Date();
    const reservedDate = new Date(reservedTime);

    // Calculate difference in milliseconds
    const timeDiff = now - reservedDate;

    // Convert milliseconds to minutes, hours, and days
    const minutes = Math.floor(timeDiff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Return the time difference in a readable format
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return `${minutes} minutes ago`;
  };

  const handleCancelBooking = async (busId, userId, seatId, index) => {
    try {
      console.log(userId);
      // Assuming there's an API endpoint for canceling a passenger's booking on a bus
      const cancelResponse = await axios.delete(
        `${backEndUrl}/formselection/${busId}`,
        { data: { seatId: seatId, userId: userId } }
      );

      console.log(seatList[index]);
      if (cancelResponse.status === 200) {
        setSeatList((prevList) =>
          prevList.filter((seat) => seat._id !== seatId)
        ); // Remove passenger from the list
        setPassengers((prevList) =>
          prevList.filter((passenger, idx) => idx !== index)
        ); // Remove passenger from the list
      }
      // console.log(passengers.)
      // fetchPassengersForBus(busId)
    } catch (error) {
      console.error("Error canceling passenger booking:", error);
    }
  };
  const formatTo12Hour = (timeString) => {
    const date = new Date(timeString);
    if (isNaN(date)) return timeString; // if invalid date, return original

    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // convert 0 (midnight) to 12
    minutes = minutes.toString().padStart(2, "0"); // ensure 2 digits

    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div
      className="bus-list-page"
      style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <h2
        className="title"
        style={{ fontSize: "32px", marginBottom: "20px", textAlign: "center" }}
      ></h2>

      <div className="bus-selection">
        <h3 style={{ fontSize: "24px", marginBottom: "15px" }}>Select a Bus</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {busList.map((bus) => (
            <li key={bus._id} >
              <button
                className="bus-btn"
                onClick={() => handleBusSelect(bus._id)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2980b9")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    selectedBusId === bus._id ? "#2ecc71" : "#3498db")
                }
              >
                {formatTo12Hour(bus.departureTime)} — {bus.busNumber}
              </button>

              {selectedBusId === bus._id && (
                <div
                  className="bus-details-dropdown "
                  style={{
                    backgroundColor: "#f9f9f9",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginTop: "10px",
                    padding: "20px",
                    animation: "fadeIn 0.5s",
                  }}
                >
                  <div className="search-bar" style={{ marginBottom: "15px" }}>
                    <input
                      type="text"
                      placeholder="Search by username, phone, or departure time"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{
                        padding: "10px",
                        width: "100%",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </div>

                  <div className="passenger-table">
                    {/* <h3>
                      Reserved Passengers for Bus {bus.busNumber} at{" "}
                      {bus.departureTime}
                    </h3> */}

                    {/* Check if filtered passengers is an array and has data */}
                    {Array.isArray(passengers) && passengers.length > 0 ? (
                      <div
                        className="table-container"
                        style={{ overflowX: "auto" }}
                      >
                        <table
                          className="passenger-table"
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "16px",
                            minWidth: "700px",
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                #
                              </th>
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                User Name
                              </th>
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                Phone Number
                              </th>
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                Route
                              </th>
                              {/* <th style={{ padding: "10px", border: "1px solid #ccc" }}>Departure Time</th> */}
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                Reserved Time
                              </th>{" "}
                              {/* New column */}
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {passengers.map((passenger, idx) => {
                              const seat = seatList[idx]; // get corresponding seat

                              return (
                                <tr key={idx}>
                                  <td
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ccc",
                                    }}
                                  >
                                    {idx + 1}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ccc",
                                    }}
                                  >
                                    {passenger.name}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ccc",
                                    }}
                                  >
                                    {passenger.phoneNumber}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ccc",
                                    }}
                                  >
                                    {seat?.route}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ccc",
                                    }}
                                  >
                                    {calculateTimeDifference(seat?.bookedTime)}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ccc",
                                    }}
                                  >
                                    <button
                                      className="cancel-button"
                                      style={{
                                        padding: "8px 14px",
                                        backgroundColor: "#e74c3c",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        transition: "background-color 0.3s",
                                      }}
                                      onClick={() =>
                                        handleCancelBooking(
                                          bus._id,
                                          passenger._id,
                                          seat._id,
                                          idx
                                        )
                                      }
                                    >
                                      Cancel
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-data">
                        No passengers found matching your search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default BusList;
