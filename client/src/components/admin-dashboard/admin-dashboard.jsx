import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-Dashboard.css";

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
  const [schedules, setSchedules] = useState([]);

  // Handlers to add data
  const addStop = (stop) => setStops((prev) => [...prev, stop]);
  const addRoute = (route) => setRoutes((prev) => [...prev, route]);
  const addBus = (bus) => setBuses((prev) => [...prev, bus]);
  const addSchedule = (schedule) => setSchedules((prev) => [...prev, schedule]);

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
            schedules={schedules}
            onAddSchedule={addSchedule}
          />
        );
      default:
        return <div>Select a page from sidebar</div>;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-layout">
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
            <li onClick={() => handleNavClick("stop")}>
              <span className="icon">📍</span> Stops
            </li>
            <li onClick={() => handleNavClick("route")}>
              <span className="icon">🛣</span> Routes
            </li>
            <li onClick={() => handleNavClick("bus")}>
              <span className="icon">🚌</span> Buses
            </li>
            <li onClick={() => handleNavClick("schedule")}>
              <span className="icon">⏰</span> Schedule
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">{renderPage()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;