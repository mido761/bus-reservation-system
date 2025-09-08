import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

import MyTrips from "./MyTrips/mytrips";
import MyPayments from "./myPayments/myPayments";
import MyBookings from "./myBookings/myBookings";
import Hero from "./Hero/hero";
import Footer from "../footer/footer";

const MENU = [
  { key: "mytrips", label: "My Trips", icon: "🚌", component: MyTrips },
  { key: "myPayments", label: "My Payments", icon: "💳", component: MyPayments },
  { key: "myBooking", label: "My Booking", icon: "📄", component: MyBookings },
];

export default function UserAccount() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (key) => setActive(key);

  const ActiveComponent = MENU.find((item) => item.key === active)?.component || null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Sidebar */}
      {/* Mobile Sidebar */}
<Sheet>
  <SheetTrigger asChild>
    <Button className="md:hidden fixed top-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
      {/* Hamburger Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </Button>
  </SheetTrigger>

  <SheetContent side="left" className="w-64 p-6 transition-all duration-300 ease-in-out">
    <div className="flex items-center justify-between mb-6">
      <span className="text-xl font-bold">User Account</span>
    </div>

    <ul className="space-y-3">
      {MENU.map((item) => (
        <SheetClose key={item.key} asChild>
          <li
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
              active === item.key ? "bg-blue-100 font-semibold" : ""
            }`}
            onClick={() => handleSelect(item.key)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        </SheetClose>
      ))}
    </ul>
  </SheetContent>
</Sheet>


      {/* Desktop Layout */}
      <div className="flex flex-1">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-2xl font-bold">User Account</span>
            <Button variant="ghost" onClick={() => navigate("/home")}>
              ←
            </Button>
          </div>
          <ul className="space-y-3">
            {MENU.map((item) => (
              <li
                key={item.key}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  active === item.key ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() => handleSelect(item.key)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {active === null ? <Hero /> : ActiveComponent && <ActiveComponent />}
        </main>
      </div>
    </div>
  );
}
