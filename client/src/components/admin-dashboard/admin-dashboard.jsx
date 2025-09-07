import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
  const [trips, setTrips] = useState([]);

  // Handlers
  const addStop = (stop) => setStops((prev) => [...prev, stop]);
  const addRoute = (route) => setRoutes((prev) => [...prev, route]);
  const addBus = (bus) => setBuses((prev) => [...prev, bus]);
  const addTrip = (trip) => setTrips((prev) => [...prev, trip]);

  // Page state
  const [activePage, setActivePage] = useState("trip");

  const renderPage = () => {
    switch (activePage) {
      case "stop":
        return <Stop stops={stops} onAddStop={addStop} />;
      case "route":
        return <Route stops={stops} routes={routes} onAddRoute={addRoute} />;
      case "bus":
        return <Bus buses={buses} onAddBus={addBus} />;
      case "trip":
        return (
          <Schedule
            buses={buses}
            routes={routes}
            trips={trips}
            onAddTrip={addTrip}
          />
        );
      default:
        return <div className="text-center py-6">Select a page from sidebar</div>;
    }
  };

  const SidebarMenu = ({ isMobile = false }) => (
    <nav className="space-y-2">
      <Button
        variant={activePage === "trip" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActivePage("trip")}
      >
        🚍 Trips
      </Button>
      <Button
        variant={activePage === "route" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActivePage("route")}
      >
        🛣 Routes
      </Button>
      <Button
        variant={activePage === "stop" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActivePage("stop")}
      >
        📍 Stops
      </Button>
      <Button
        variant={activePage === "bus" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => setActivePage("bus")}
      >
        🚌 Buses
      </Button>
      {isMobile && (
        <Button variant="destructive" className="w-full" onClick={() => navigate("/")}>⬅ Back Home</Button>
      )}
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="w-full border-b bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/")}>⬅ Home</Button>
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>

        {/* Mobile Sidebar Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SidebarMenu isMobile />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden lg:block w-64 border-r bg-gray-50 p-4">
          <SidebarMenu />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-4">{renderPage()}</CardContent>
          </Card>
        </main>
      </div>

     
    </div>
  );
};

export default AdminDashboard;
