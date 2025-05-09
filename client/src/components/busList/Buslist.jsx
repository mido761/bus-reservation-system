import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingScreen from "../loadingScreen/loadingScreen";
import LoadingPage from "../loadingPage/loadingPage";
import Overlay from "../overlayScreen/overlay";
import "./Buslist.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const BusList = () => {
  const [busList, setBusList] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [seatList, setSeatList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const fetchBusList = async () => {
    try {
      const response = await axios.get(`${backEndUrl}/buses`);
      setBusList(response.data); // Assuming response data contains buses in "data"
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching bus list:", error);
      setPageLoading(false);
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
      // console.log("seatList: ", response.data.data.seats);
      // console.log("usersList: ", response.data.data.orderedUsers);

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
  const query = searchQuery.toLowerCase().trim();  // Trim the search query to avoid leading/trailing spaces

  // Extract and prepare fields for comparison
  const userName = passenger?.name?.toLowerCase() || "";  // Safe check for passenger name
  const phoneNumber = (String(passenger?.phoneNumber) || "").toLowerCase();  // Safe check for phone number
  const route = (seatList[idx]?.route?.toLowerCase() || "");  // Safe check for route, default to empty string if undefined

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
    setIsLoading(true);
    try {
        const authResponse = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const userID = authResponse.data.userId;
   
      // Assuming there's an API endpoint for canceling a passenger's booking on a bus
      const cancelResponse = await axios.delete(
        `${backEndUrl}/formselection/${busId}`,
        { data: { seatId: seatId, userId: userID } }
      );

      if (cancelResponse.status === 200) {
        setSeatList((prevList) =>
          prevList.filter((seat) => seat._id !== seatId)
        ); // Remove passenger from the list
        setPassengers((prevList) =>
          prevList.filter((passenger, idx) => idx !== index)
        ); // Remove passenger from the list

        setIsLoading(false);
        setSelectedBusId("");
        setAlertMessage("✅ Seat canceled successfully!");
        setAlertFlag(true);

        setTimeout(() => {
          setAlertFlag(false);
        }, 2200);
      }
      // console.log(passengers.)
      // fetchPassengersForBus(busId)
    } catch (error) {
      console.error("Error canceling passenger booking:", error);
      setIsLoading(false);
      setAlertMessage("⚠️ Error canceling the seat!");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };

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

  //navigte with the bus id in the url to enable me to edit the bus
  const handleEdit = (busId) => {
    navigate(`/edit-bus/${busId}`);
  };

  const handleDel = async (busId) => {
    const firstConfirmation = window.confirm(
      "Are you sure you want to delete this bus?"
    );
    if (!firstConfirmation) return;

    const secondConfirmation = window.confirm(
      "This action cannot be undone. Do you want to proceed?"
    );
    if (!secondConfirmation) return;

    setIsLoading(true);
    try {
      await axios.delete(`${backEndUrl}/buses/busForm/${busId}`);
      setBusList(busList.filter((bus) => bus._id !== busId));

      setIsLoading(false);
      setSelectedBusId("");
      setAlertMessage("✅ Bus deleted successfully!");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    } catch (err) {
      setIsLoading(false);
      setAlertMessage("⚠️ Error deleting the bus");
      setAlertFlag(true);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
    }
  };


  if (pageLoading) {
    return <LoadingPage />;
  }

  return (
  <div className="bus-list-page" style={{ padding: "20px", margin: "0 auto" }}>
    <h2
      className="title"
      style={{ fontSize: "32px", marginBottom: "20px", textAlign: "center" }}
    ></h2>
    <div className="bus-selection">
      <h3 style={{ fontSize: "24px", marginBottom: "15px" }}>Select a Bus</h3>
      {busList.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {busList.map((bus) => (
            <li key={bus._id}>
              <button
                className="bus-btn"
                onClick={() => handleBusSelect(bus._id)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2ecc71")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    selectedBusId === bus._id
                      ? "#2ecc71"
                      : "var(--primary-color)")
                }
              >
                <div className="time-and-schedule">
                  <p>{convertTo12HourFormat(bus.departureTime)}</p>
                  <p>{bus.schedule}</p>
                </div>
                <span className="routeName">
                  {bus.location.pickupLocation}{" "}
                </span>{" "}
                to{" "}
                <span className="routeName">
                  {bus.location.arrivalLocation}
                </span>
              </button>
              {selectedBusId === bus._id && (
                <div className="bus-details-dropdown">
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
                    {Array.isArray(passengers) && passengers.length > 0 ? (
                      <div
                        className="table-container"
                        style={{ overflowX: "auto" }}
                      >
                        <table className="passenger-table">
                          <thead>
                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                  borderTopLeftRadius: "10px",
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
                              <th
                                style={{
                                  padding: "10px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                Reserved Time
                              </th>{" "}
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
                            {passengers
                              .filter((passenger, idx) => {
                                // Convert search query to lowercase
                                const query = searchQuery.toLowerCase().trim();

                                // Extract data to check against
                                const userName = passenger?.name?.toLowerCase() || "";
                                const phoneNumber =
                                  (String(passenger?.phoneNumber) || "").toLowerCase();
                                const route = (seatList[idx]?.route?.toLowerCase() || "");

                                // Check if any field matches the search query
                                return (
                                  userName.includes(query) ||
                                  phoneNumber.includes(query) ||
                                  route.includes(query)
                                );
                              })
                              .map((passenger, idx) => {
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
                    ) : loading ? (
                      <LoadingComponent />
                    ) : (
                      <p className="no-data">No passengers found matching your search.</p>
                    )}
                  </div>
                  <div className="actions-container">
                    <button
                      className="del-btn"
                      onClick={() => handleDel(bus._id)}
                    >
                      <img
                        src="delete.png"
                        alt="Delete"
                        style={{ width: "24px", height: "24px" }}
                      />
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(bus._id)}
                    >
                      <img
                        src="editing.png"
                        alt="Edit"
                        style={{ width: "24px", height: "24px" }}
                      />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data">No Buses found.</p>
      )}
    </div>
    {isLoading && <LoadingScreen />}

    {alertFlag && (
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    )}
  </div>
);
}
export default BusList;