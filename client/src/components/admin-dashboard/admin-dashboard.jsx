import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-dashboard.css";

import Stop from "./Stops/stops";
import Route from "./Route/route";
import Bus from "./Bus/bus";
import Schedule from "./Schedule/schedule";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Master data lists
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]); // changed from schedules

  // Handlers to add data
  const addStop = (stop) => setStops((prev) => [...prev, stop]);
  const addRoute = (route) => setRoutes((prev) => [...prev, route]);
  const addBus = (bus) => setBuses((prev) => [...prev, bus]);
  const addTrip = (trip) => setTrips((prev) => [...prev, trip]); // changed from addSchedule

  // For demo: track which page to show (replace with React Router if you want)
  const [activePage, setActivePage] = useState("stop");

  // Sidebar navigation handler
  const handleNavClick = (page) => setActivePage(page);

  // Render selected page component with props
  const renderPage = () => {
    switch (activePage) {
      case "stop":
        return <Stop stops={stops} onAddStop={addStop} />;
      case "route":
        return <Route stops={stops} routes={routes} onAddRoute={addRoute} />;
      case "bus":
        return <Bus buses={buses} onAddBus={addBus} />;
      case "schedule":
        return (
          <Schedule
            buses={buses}
            routes={routes}
            trips={trips} // changed from schedules
            onAddTrip={addTrip} // changed from onAddSchedule
          />
        );
      default:
        return <div>Select a page from sidebar</div>;
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* <div className="dashboard-layout"> */}
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <button
            className="back-button"
            onClick={() => navigate("/")}
            aria-label="Go back to home"
            title="Go back"
            type="button"
          >
            ←
          </button>
          Admin Panel
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => handleNavClick("trip")}>
            <span className="icon">🚍</span>  trip
          </li>
          <li onClick={() => handleNavClick("route")}>
            <span className="icon">🛣</span> Routes
          </li>
          <li onClick={() => handleNavClick("stop")}>
            <span className="icon">📍</span> Stops
          </li>

          <li onClick={() => handleNavClick("bus")}>
            <span className="icon">🚌</span> Buses
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      {/* {renderPage()} */}
      <main className="dashboard-main">{renderPage()}</main>
      {/* </div> */}
    </div>
  );
};

export default AdminDashboard;