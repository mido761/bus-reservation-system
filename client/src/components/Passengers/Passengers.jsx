import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const PassengersPage = () => {
  const location = useLocation();
  const { busId } = location.state || {}; // Get the busId from the state passed via navigate
  const [passengers, setPassengers] = useState([]);
  const [seatBookings, setSeatBookings] = useState([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerId, setPassengerId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [showCancelOverlay, setShowCancelOverlay] = useState(false);

  const handleSeatSellection = (passengerId, index, passengerName) => {
    const seatData = seatBookings[index];
    setShowCancelOverlay(true);
    setPassengerName(passengerName);
    setSeatId(seatData._id);
    setPassengerId(passengerId);
  };

  const handleSeatCancel = async () => {
    try {
      const authResponse = await axios.get(`${backEndUrl}/auth`, {
        withCredentials: true,
      });
      const userId = authResponse.data.userId; // user Id from the session

      const cancelResponse = await axios.delete(
        `${backEndUrl}/formselection/${busId}`,
        { data: { seatId: seatId, userId: userId } }
      );
      console.log("Seat: ", seatBookings.filter(seat => seat._id === seatId))

      if (cancelResponse.status === 200) {
        console.log("cancelled successfully");
        setShowCancelOverlay(false);
        const currentSeat = seatBookings.filter(seat => seat._id === seatId)[0]._id

        const index = seatBookings.indexOf(currentSeat);
        console.log(index)

        if (index !== -1) {
          setPassengers(passengers.splice(index, 1));
          console.log(passengers.filter)
        }
        setPassengerName("");
        setSeatId("");
        setPassengerId("");
      }
    } catch (error) {
      const currentSeat = seatBookings.filter(seat => seat._id === seatId)[0]._id
      console.log("Seat: ", currentSeat)
      
      console.error("Error cancelling the seat", error);
      setShowCancelOverlay(false);
    }
  };
  // Fetch reserved passengers data when the component mounts
  useEffect(() => {
    if (busId) {
      const fetchReservedPassengers = async () => {
        try {
          const response = await axios.get(`${backEndUrl}/seats/${busId}`);
          const seatBookings = response.data.data;
          setSeatBookings(seatBookings);
          // Ids with duplication
          const bookedByIds = seatBookings.map((item) => item.bookedBy);

          // Ids with NO duplication
          const uniqueIds = [...new Set(bookedByIds)];

          // Names response with no duplications
          const passengersNamesResponse = await axios.post(
            `${backEndUrl}/user/profilesNames`,
            { userIds: uniqueIds }
          );

          // Users Ids and names
          const users = passengersNamesResponse.data;

          // Create a map for fast lookup by user ID
          const userMap = users.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
          }, {});

          const result = seatBookings.map(
            (booking) => userMap[booking.bookedBy]
          );
          // if (Array.isArray(data)) {
          setPassengers(result);

          // } else if (Array.isArray(data.passengers)) {
          // setPassengers(data.passengers);
          // } else {
          // console.warn("Unexpected response format", data);
          // setPassengers([]);
          // }
        } catch (error) {
          console.error("Error fetching reserved passengers:", error);
          setPassengers([]);
        }
      };

      fetchReservedPassengers();
      console.log(seatBookings);
    }
  }, [busId]);

  return (
    <div className="passengers-page">
      <h2>Reserved Passengers</h2>

      {passengers.length > 0 ? (
        <table>
          <thead>
            {/* <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Seats Reserved</th>
            </tr> */}
          </thead>
          <tbody>
            {passengers.map((passenger, idx) => (
              <tr key={idx}>
                <td
                  onClick={() =>
                    handleSeatSellection(passenger._id, idx, passenger.name)
                  }
                >
                  {" "}
                  {idx} {passenger.name}{" "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reserved passengers found.</p>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelOverlay && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Cancel Booking</h2>
            <p>
              <strong>Name:</strong> {passengerName}
            </p>
            <button onClick={() => handleSeatCancel()}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengersPage;
