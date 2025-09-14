import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TripForm = ({ formData, routes, handleChange, handleSubmit }) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Route Selection */}
      <div className="flex flex-col">
        <Label htmlFor="routeId">Route</Label>
        <Select
          value={formData.routeId}
          onValueChange={(value) =>
            handleChange({ target: { name: "routeId", value } })
          }
        >
          <SelectTrigger className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select Route" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-lg shadow-lg">
            {Array.isArray(routes) &&
              routes.map((route) => (
                <SelectItem key={route.route_id} value={route.route_id}>
                  {route.source} → {route.destination}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Departure Date */}
      <div className="flex flex-col">
        <Label htmlFor="date">Departure Date</Label>
        <Input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Departure Time */}
      <div className="flex flex-col">
        <Label htmlFor="departureTime">Departure Time</Label>
        <Input
          id="departureTime"
          type="time"
          name="departureTime"
          value={formData.departureTime}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Arrival Time */}
      <div className="flex flex-col">
        <Label htmlFor="arrivalTime">Arrival Time</Label>
        <Input
          id="arrivalTime"
          type="time"
          name="arrivalTime"
          value={formData.arrivalTime}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Submit Button */}
      <div className="col-span-full flex justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2 shadow-md transition"
        >
          Add Trip
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
