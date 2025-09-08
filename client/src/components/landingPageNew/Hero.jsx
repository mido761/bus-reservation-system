import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, CalendarDays, MapPin, Users } from "lucide-react";
// import heroImage from "@/assets/hero-bus.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Hero = ({
  pickupPoint,
  arrivalPoint,
  date,
  setPickupPoint,
  setArrivalPoint,
  setDate,
  onSearch,
  setAllRoutes,
}) => {
  const [pickupOptions, setPickupOptions] = useState([]);
  const [arrivalOptions, setArrivalOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${backEndUrl}/route/get-routes`)
      .then((res) => {
        const routes = res.data || [];
        console.log(res);
        setPickupOptions([...new Set(routes.map((r) => r.source))]);
        setArrivalOptions([...new Set(routes.map((r) => r.destination))]);
        setAllRoutes(routes);
      })
      .catch(() => {
        setPickupOptions([]);
        setArrivalOptions([]);
      })
      .finally(setIsLoading(false));
  }, []);

  return (
    <section className="relative overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      {/* <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(33, 150, 243, 0.8), rgba(25, 118, 210, 0.9)), url(${heroImage})`,
        }}
      /> */}
      {/* ✅ Top Section with Background (only for text) */}
    <div className="relative w-full">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-no-repeat bg-contain md:bg-cover"
        style={{ backgroundImage: "url('/van.jpg')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center py-16">
        <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-10 leading-tight">
            Travel Made <span className="text-primary-light">Simple</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto">
            Book bus tickets instantly and travel with comfort and reliability every time
          </p>
        </div>

          {/* Booking Form */}
          <Card className="bg-white/95 backdrop-blur-sm p-8 shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  From
                </label>
                <Select value={pickupPoint} onValueChange={setPickupPoint}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Enter departure city" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupOptions.length > 0 && pickupOptions.map((pickup, idx) => (
                      <SelectItem key={idx} value={pickup}>
                        {pickup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  To
                </label>
                <Select value={arrivalPoint} onValueChange={setArrivalPoint}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Enter destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {arrivalOptions.length > 0 && arrivalOptions.map((arrival, idx) => (
                      <SelectItem key={idx} value={arrival}>
                        {arrival}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-red-500" />
                  Date
                </label>
                <Input
                  type="date"
                  className="w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Passengers
                </label>
                <select className="w-full h-12 px-3 py-2 bg-background border border-input rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4+ Passengers</option>
                </select>
              </div> */}
            </div>

            <Button
              variant="default"
              className="w-full mt-8 h-14 text-lg font-semibold shadow-soft"
              onClick={onSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search Trips"
              )}
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
