import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Stop from "./Stops/stops";
import Route from "./Route/route";
import Bus from "./Bus/bus";
import Schedule from "./Schedule/schedule";

const MENU = [
  { key: "Trips", label: "Trips", icon: "📅", component: Schedule },
  { key: "stops", label: "Stops", icon: "🛑", component: Stop },
  { key: "routes", label: "Routes", icon: "🛣️", component: Route },
  { key: "bus", label: "Bus", icon: "🚌", component: Bus }
  ,
];

export default function AdminDashboard() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const ActiveComponent =
    MENU.find((item) => item.key === active)?.component || null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-6 pb-20">
        {active === null ? (
          <div className="text-center text-gray-700">
            <h1 className="text-2xl font-bold mb-2">Welcome, Admin</h1>
            <p>Select a section from the bottom menu to get started.</p>
          </div>
        ) : (
          ActiveComponent && <ActiveComponent />
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
        <ul className="flex justify-around items-center py-2">
          {MENU.map((item) => (
            <li
              key={item.key}
              className={`flex flex-col items-center cursor-pointer transition-colors ${
                active === item.key
                  ? "text-indigo-600 font-bold"
                  : "text-gray-600"
              }`}
              onClick={() => setActive(item.key)}
            >
              {/* Label on top */}
              <span className="text-sm">{item.label}</span>
              {/* Icon below */}
              <span className="text-2xl">{item.icon}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
