import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import MyTrips from "./MyTrips/mytrips";
import MyPayments from "./myPayments/myPayments";
import MyBookings from "./myBookings/myBookings";
import Hero from "./Hero/hero";
import Footer from "../footer/footer";

const MENU = [
  { key: "mytrips", label: "My Trips", icon: "🚌", component: MyTrips },
  {
    key: "myPayments",
    label: "My Payments",
    icon: "💳",
    component: MyPayments,
  },
  { key: "myBooking", label: "My Booking", icon: "📄", component: MyBookings },
];

export default function UserAccount() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const ActiveComponent =
    MENU.find((item) => item.key === active)?.component || null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-6 pb-20">
        {" "}
        {/* extra padding for bottom bar */}
        {active === null ? <Hero /> : ActiveComponent && <ActiveComponent />}
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
              {/* Label (words) on top */}
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
