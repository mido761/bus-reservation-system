import { useLocation,useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import axios from "axios";
import formatDateTime from "./../../formatDateAndTime";
import "./reserve.css";
const backEndUrl = import.meta.env.VITE_BACK_END_URL;
const Reserve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, route } = location.state || {};
  const [stops, setStops] = useState([])
  const [selectedStop, setSelectedStop] = useState(null);



  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await axios.get(`${backEndUrl}/stop/get-stops-route/${route.route_id}`);
        console.log(res.data.stops)
        setStops(res.data.stops);
      } catch (err) {
        setStops([]);
      }
    };

    fetchStops();
  }, []);
  // confirm booking function
  const handleConfiremreserve = async () => {
    try{
    const res = await axios.post(`${backEndUrl}/booking/book`,{tripId:trip.trip_id, stopId:selectedStop.stop_id})
    console.log(res.data)
    const booking = res.data
    navigate("/payment",{
      state: {
       booking,
       trip,
       route,
       selectedStop
    }
    })
  }catch{
    console.log(message.error)
  }
  };
// remaing the validaton of booking and a little of CSS
  return (
    <div className="reserve-page">
      <h1>Reserve Your Trip</h1>
      {trip ? (
        <>
          <p><strong>Route:</strong> {route.source} → {route.destination}</p>
          <p><strong>Date:</strong> {trip.date}</p>
          <p><strong>Departure:</strong> {formatDateTime(trip.departure_time)}</p>
          <p><strong>Arrival:</strong> {formatDateTime(trip.arrival_time)}</p>
          <div>
          <p><strong>Select a stop:</strong></p>
          <div className="flex flex-wrap gap-2">
            {stops.map((stop) => (
              <button
                key={stop.stop_id}
                onClick={() => setSelectedStop(stop)}
                className={`px-4 py-2 rounded-lg border 
                  ${selectedStop?.stop_id === stop.stop_id 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"}`}
              >
                {stop.stop_name} – {stop.location}
              </button>
            ))}
          </div>

          {selectedStop && (
            <p className="mt-4">
              ✅ You selected: <strong>{selectedStop.stop_name}</strong>
            </p>
          )}
          </div>
          <button className="confirm-btn" onClick={() => handleConfiremreserve()} >Confirm Reservation</button>
        </>
      ) : (
        <p className="no-trip">No trip selected.</p>
      )}
    </div>
  );
};

export default Reserve;
