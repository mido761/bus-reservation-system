import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Stop from "./Stops/stops";
import Route from "./Route/route";
import Bus from "./Bus/bus";
import Schedule from "./Schedule/schedule";
import Hero from "./adminhero";
import PassengersList from "./passengerslist/passengers-list";

const MENU = [
  { key: "Trips", label: "Trips", icon: "📅", component: Schedule },
  { key: "stops", label: "Stops", icon: "🛑", component: Stop },
  { key: "routes", label: "Routes", icon: "🛣️", component: Route },
  { key: "bus", label: "Bus", icon: "🚌", component: Bus },
  { key: "passengers-list", label: "List", icon: "👥", component: PassengersList }

];

export default function AdminDashboard() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const ActiveComponent =
    MENU.find((item) => item.key === active)?.component || null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-md">
        <div className="p-4 font-bold text-lg text-indigo-600 border-b">
          Admin Dashboard
        </div>
        <ul className="flex-1 p-4 space-y-4">
          {MENU.map((item) => (
            <li
              key={item.key}
              className={`cursor-pointer flex items-center gap-3 transition-colors ${
                active === item.key
                  ? "text-indigo-600 font-bold"
                  : "text-gray-600"
              }`}
              onClick={() => setActive(item.key)}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 pb-20 md:pb-6">
        {active === null ? (
          <Hero />
        ) : (
          ActiveComponent && <ActiveComponent />
        )}
      </main>

      {/* Sticky bottom bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md md:hidden">
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
              <span className="text-sm">{item.label}</span>
              <span className="text-2xl">{item.icon}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
