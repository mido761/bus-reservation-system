import formatDateTime from "../../formatDateAndTime";
import { useNavigate } from "react-router-dom";

const TripList = ({
  trips,
  routes,
  handleDel,
  handleEdit,
  setTrips,
  setIsLoading,
  setAlertMessage,
  setAlertFlag,
}) => {
  const navigate = useNavigate();

  return (
    <div className="list-container">
      <h2>Trip List</h2>
      <ul className="list">
        {Array.isArray(trips) &&
          trips.map((trip) => (
            <li key={trip.trip_id}>
              {formatDateTime(trip.date, "date")}
              <br />
              {formatDateTime(trip.departure_time)} ----{" "}
              {formatDateTime(trip.arrival_time)}
              <br />
              {routes.find((route) => route.route_id === trip.route_id)?.source}
              <div className="actions-container">
                <button
                  className="action-button del-btn"
                  onClick={() =>
                    handleDel(
                      trip.trip_id,
                      "trip",
                      "/trip/del-trip",
                      trips,
                      setTrips,
                      setIsLoading,
                      setAlertMessage,
                      setAlertFlag
                    )
                  }
                >
                  <img className="action-icon" src="delete.png" alt="Delete" />
                </button>
                <button
                  className="action-button edit-btn"
                  onClick={() => handleEdit(trip, "edit-trip", navigate)}
                >
                  <img className="action-icon" src="editing.png" alt="Edit" />
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default TripList;
