import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import formatDateTime from "../../formatDateAndTime";

const TripList = ({
  trips,
  routes,
  buses,
  selectedBus,
  setSelectedBus,
  handleDel,
  handleEdit,
  handleLink,
  setTrips,
  setIsLoading,
  setAlertMessage,
  setAlertFlag,
}) => {
  const navigate = useNavigate();

  if (!Array.isArray(trips) || trips.length === 0) {
    return <p className="text-gray-500">No trips available.</p>;
  }

  const handleSelectChange = (value) => {
    setSelectedBus(value); // store selected bus plate_number
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => {
        const route = routes.find((r) => r.route_id === trip.route_id);

        return (
          <Card key={trip.trip_id} className="shadow-md border border-gray-200">
            <CardContent className="space-y-2">
              <p className="font-semibold text-lg">
                {route
                  ? `${route.source} → ${route.destination}`
                  : "Unknown Route"}
              </p>
              <p className="text-gray-600">
                Date: {formatDateTime(trip.date, "date")}
              </p>
              <p className="text-gray-600">
                Departure: {formatDateTime(trip.departure_time)} | Arrival:{" "}
                {formatDateTime(trip.arrival_time)}
              </p>

              <div className="flex flex-col items-center gap-2 mt-4">
                <Select value={selectedBus} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.bus_id} value={bus.plate_number}>
                        {bus.plate_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="default"
                  className="w-full"
                  size="sm"
                  onClick={(e) => handleLink(e, trip.trip_id)}
                >
                  Assign to bus
                </Button>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => handleEdit(trip, "edit-trip", navigate)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    size="sm"
                    onClick={() =>
                      handleDel(
                        trip.trip_id,
                        "trip",
                        "/trip/del-trip",
                        trips,
                        setTrips,
                        setIsLoading,
                        setAlertMessage,
                        setAlertFlag
                      )
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TripList;
