import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarDays, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

export default function SearchBar({
  pickupPoint,
  arrivalPoint,
  date,
  setPickupPoint,
  setArrivalPoint,
  setDate,
  onSearch,
  setAllRoutes,
}) {
  const [pickupOptions, setPickupOptions] = useState([]);
  const [arrivalOptions, setArrivalOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${backEndUrl}/route/get-routes`)
      .then((res) => {
        const routes = res.data || [];
        setPickupOptions([...new Set(routes.map((r) => r.source))]);
        setArrivalOptions([...new Set(routes.map((r) => r.destination))]);
        setAllRoutes(routes);
      })
      .catch(() => {
        setPickupOptions([]);
        setArrivalOptions([]);
      });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Pickup Point */}
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        From
        <Select value={pickupPoint} onValueChange={setPickupPoint}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Enter departure city" />
          </SelectTrigger>
          <SelectContent>
            {pickupOptions.map((pickup, idx) => (
              <SelectItem key={idx} value={pickup}>
                {pickup}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>

      {/* Arrival Point */}
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        To
        <Select value={arrivalPoint} onValueChange={setArrivalPoint}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Enter destination" />
          </SelectTrigger>
          <SelectContent>
            {arrivalOptions.map((arrival, idx) => (
              <SelectItem key={idx} value={arrival}>
                {arrival}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>

      {/* Date */}
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        Date
        <Input
          type="date"
          className="w-auto"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Label>

      {/* Search Button */}
      <Button
        type="button"
        className="w-32"
        onClick={onSearch}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
      </Button>
    </section>
  );
}
