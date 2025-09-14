import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

import MyTrips from "./MyTrips/mytrips";
import MyPayments from "./myPayments/myPayments";
import MyBookings from "./myBookings/myBookings";
import Hero from "./Hero/hero";

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
  const [active, setActive] = useState("myBooking");
  const navigate = useNavigate();

  const ActiveComponent =
    MENU.find((item) => item.key === active)?.component || null;

  return (
    <div className="min-h-screen h-full w-full flex md:grid md:grid-rows-1 md:grid-cols-12 justify-center items-start md:justify-start md:items-start bg-gray-50 pb-8">
      {/* Sidebar for desktop */}
      <aside className="fixed hidden md:block col-span-3 bg-white shadow p-4 m-4 w-64 h-[85%] shadow-md border border-gray-200 rounded-xl">
        <div className="p-4 font-bold text-lg text-indigo-600 border-b flex justify-between items-center">
          User Account
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
      <main className="min-h-screen w-full flex flex-col gap-4 col-span-9 mx-auto p-4 px-8 md:ml-64">
        <Card className="p-6">
          {active === null ? <Hero /> : ActiveComponent && <ActiveComponent />}
        </Card>
      </main>

      {/* Sticky bottom bar for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md md:hidden">
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
