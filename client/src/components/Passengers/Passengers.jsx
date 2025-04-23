import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const PassengersPage = () => {
  const location = useLocation();
  const { busId } = location.state || {}; // Get the busId from the state passed via navigate
  const [passengers, setPassengers] = useState([]);

  // Fetch reserved passengers data when the component mounts
  useEffect(() => {
    if (busId) {
      const fetchReservedPassengers = async () => {
        try {
          const response = await axios.get(`/api/reservations/${busId}`);
          const data = response.data;

          if (Array.isArray(data)) {
            setPassengers(data);
          } else if (Array.isArray(data.passengers)) {
            setPassengers(data.passengers);
          } else {
            console.warn("Unexpected response format", data);
            setPassengers([]);
          }
        } catch (error) {
          console.error("Error fetching reserved passengers:", error);
          setPassengers([]);
        }
      };

      fetchReservedPassengers();
    }
  }, [busId]);

  return (
    <div className="passengers-page">
      <h2>Reserved Passengers</h2>
      
      {passengers.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Seats Reserved</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((passenger, idx) => (
              <tr key={idx}>
                <td>{passenger.name}</td>
                <td>{passenger.phoneNumber}</td>
                <td>{passenger.numberOfSeats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reserved passengers found.</p>
      )}
    </div>
  );
};

export default PassengersPage;
