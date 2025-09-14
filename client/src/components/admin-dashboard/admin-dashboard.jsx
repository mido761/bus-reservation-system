import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Stop from "./Stops/stops";
import Route from "./Route/route";
import Bus from "./Bus/bus";
import Schedule from "./Schedule/schedule";
import Hero from "./adminhero";

const MENU = [
  { key: "Trips", label: "Trips", icon: "📅", component: Schedule },
  { key: "stops", label: "Stops", icon: "🛑", component: Stop },
  { key: "routes", label: "Routes", icon: "🛣️", component: Route },
  { key: "bus", label: "Bus", icon: "🚌", component: Bus },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("Trips");
  const navigate = useNavigate();

  const ActiveComponent =
    MENU.find((item) => item.key === active)?.component || null;

  return (
    <div className="min-h-screen h-full w-full flex md:grid md:grid-rows-1 md:grid-cols-12 justify-center items-start md:justify-start md:items-start bg-gray-50 pb-8">
      {/* Sidebar for desktop */}
      {/* col-span-3 bg-white shadow p-4 */}
      <aside className="fixed hidden md:block col-span-3 bg-white shadow p-4 m-4 w-64 h-[85%] shadow-md border border-gray-200 rounded-xl">
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
      <main className="w-full flex flex-col gap-4 col-span-9 mx-auto p-4 px-8 md:ml-64">
        {active === null ? <Hero /> : ActiveComponent && <ActiveComponent />}
      </main>

      {/* Sticky bottom bar for mobile */}
      <nav className=" md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
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
              <span className="text-lg">{item.icon}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
