import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Buslist.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BusList = () => {
  const [busList, setBusList] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [seatList, setseatList] = useState([]);
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
      setseatList(Array.isArray(response.data.data.seats) ? response.data.data.seats : []);
      setPassengers(Array.isArray(response.data.data.orderedUsers) ? response.data.data.orderedUsers : []);
      console.log(seatList)

      // let userlist = seatList.map(seat => seat.bookedBy);
      // console.log(userlist)
      // const response1 = await axios.post(`${backEndUrl}/seats/user`, { userList: userlist});
      // console.log(response1.data)
      // setPassengers(Array.isArray(response1.data.data) ? response1.data.data : []);
      // console.log(passengers)
    } catch (error) {
      console.error("Error fetching passengers for bus:", error);
      setseatList([]); // Optional: Clear passengers on error
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

  // Filter passengers based on search query
  const filteredPassengers = passengers.filter((passenger) => {
    const query = searchQuery.toLowerCase();
    return (
      (passenger.name?.toLowerCase() || "").includes(query) ||
      (passenger.phoneNumber?.toLowerCase() || "").includes(query) ||
      (passenger.departureTime?.toLowerCase() || "").includes(query)
    );
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

  const handleCancelBooking = async (busId, userId,seatId) => {
    try {
      console.log(userId)
      // Assuming there's an API endpoint for canceling a passenger's booking on a bus
      await axios.delete(`${backEndUrl}/formselection/${busId}`, 
       {data: { seatId: seatId, userId:userId }});
      setPassengers((prevList) => prevList.filter((passenger) => passenger._id !== userId)); // Remove passenger from the list
    } catch (error) {
      console.error("Error canceling passenger booking:", error);
    }
  };

  return (
    <div className="bus-list-page">
      <h2 className="title">Bus List</h2>

      {/* Bus selection section */}
      <div className="bus-selection">
        <h3>Select a Bus</h3>
        <ul>
          {busList.map((bus) => (
            <li key={bus._id}>
              <button
                onClick={() => handleBusSelect(bus._id)}
                style={{
                  padding: "10px",
                  backgroundColor: "#3498db",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: "10px",
                  borderRadius: "5px",
                }}
              >
                {bus.departureTime}
              </button>

              {/* Toggle the display of passengers and search/filter section */}
              {selectedBusId === bus._id && (
                <div className="bus-details-dropdown">
                  {/* Search bar for filtering passengers */}
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search by username, phone, or departure time"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{
                        padding: "8px",
                        width: "100%",
                        marginBottom: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </div>

                  {/* If a bus is selected, show passengers */}
                  <div className="passenger-table">
                    <h3>
                      Reserved Passengers for Bus {bus.busNumber} at {bus.departureTime}
                    </h3>

                    {/* Check if filtered passengers is an array and has data */}
                    {Array.isArray(filteredPassengers) && filteredPassengers.length > 0 ? (
                      <div className="table-container" style={{ overflowX: "auto" }}>
                        <table
                          className="passenger-table"
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: "600px",
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>#</th>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>User Name</th>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Phone Number</th>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Route</th>
                              {/* <th style={{ padding: "10px", border: "1px solid #ccc" }}>Departure Time</th> */}
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Reserved Time</th> {/* New column */}
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                          {filteredPassengers.map((passenger, idx) => {
                              const seat = seatList[idx]; // get corresponding seat

                              return (
                                <tr key={passenger._id}>
                                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                    {idx + 1}
                                  </td>
                                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                    {passenger.name}
                                  </td>
                                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                    {passenger.phoneNumber}
                                  </td>
                                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                    {seat?.route}
                                  </td>
                                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                    {calculateTimeDifference(seat?.bookedTime)}
                                  </td>
                                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                    <button
                                      className="cancel-button"
                                      style={{
                                        padding: "6px 12px",
                                        backgroundColor: "#e74c3c",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => handleCancelBooking(bus._id, passenger._id, seat._id)}
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
                      <p className="no-data">No passengers found matching your search.</p>
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
