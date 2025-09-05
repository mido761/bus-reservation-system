import React from "react";

const TripForm = ({ formData, routes, handleChange, handleSubmit }) => {
  return (
    <form action="" onSubmit={handleSubmit} className="add-form">
      <h2>Add Trip</h2>

      {/* <label htmlFor="buses">
          Available Buses
          <select name="busIds" id="buses" multiple onChange={handleChange}>
            {Array.isArray(availableBuses) && availableBuses.map((bus) => (
              <option key={bus._id} value={bus._id}>
                {bus.plateNumber}
              </option>
            ))}
          </select>
        </label> */}

      <label htmlFor="routes">
        Routes
        <select
          name="routeId"
          id="routes"
          onChange={(e) => {
            handleChange(e);
          }}
        >
          <option value="default">Choose Route</option>
          {Array.isArray(routes) &&
            routes.map((route) => (
              <option key={route.route_id} value={route.route_id}>
                {route.source} ---- {route.destination}
              </option>
            ))}
        </select>
      </label>

      <label>
        Departure Date
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
      </label>

      <label>
        Departure Time
        <input type="time" name="departureTime" value={formData.departureTime} onChange={handleChange} />
      </label>

      <label>
        Arrival Time
        <input type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} />
      </label>

      <button type="submit">Add Trip</button>
    </form>
  );
};

export default TripForm;
