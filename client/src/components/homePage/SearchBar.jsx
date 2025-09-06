import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
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
    <div className="flex flex-col items-center max-w-md w-64 h-[fit-content] gap-7  justify-center p-4 bg-white shadow-md rounded-xl">
      {/* Pickup Point */}
      <Select value={pickupPoint} onValueChange={setPickupPoint}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pickup Point" />
        </SelectTrigger>
        <SelectContent>
          {pickupOptions.map((pickup, idx) => (
            <SelectItem key={idx} value={pickup}>
              {pickup}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Arrival Point */}
      <Select value={arrivalPoint} onValueChange={setArrivalPoint}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Arrival Point" />
        </SelectTrigger>
        <SelectContent>
          {arrivalOptions.map((arrival, idx) => (
            <SelectItem key={idx} value={arrival}>
              {arrival}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date */}
      <Input
        type="date"
        className="w-auto"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Search Button */}
      <Button type="button" className="w-32" onClick={onSearch} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
      </Button>
   
    </div>
  );
}
