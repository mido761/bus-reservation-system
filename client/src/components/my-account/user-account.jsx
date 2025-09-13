import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import MyTrips from "./MyTrips/mytrips";
import MyPayments from "./myPayments/myPayments";
import MyBookings from "./myBookings/myBookings";
import Hero from "./Hero/hero";

const MENU = [
  { key: "mytrips", label: "My Trips", icon: "🚌", component: MyTrips },
  { key: "myPayments", label: "My Payments", icon: "💳", component: MyPayments },
  { key: "myBooking", label: "My Booking", icon: "📄", component: MyBookings },
];

export default function UserAccount() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const ActiveComponent =
    MENU.find((item) => item.key === active)?.component || null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-md">
        <div className="p-4 font-bold text-lg text-indigo-600 border-b flex justify-between items-center">
          User Account
          <button
            className="text-gray-500 hover:text-indigo-600"
            onClick={() => navigate("/home")}
          >
            ←
          </button>
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
