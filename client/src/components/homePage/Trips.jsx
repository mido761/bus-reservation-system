import React from "react";
import formatDateAndTime from "../../formatDateAndTime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, ArrowRight } from "lucide-react";

const Trips = ({ trips = [], isLoading, onBook, route, hasSearched, tripRefs }) => {
  if (isLoading)
    return (
      <div className="flex justify-center items-center py-10 text-muted-foreground text-lg">
        Loading trips...
      </div>
    );

  if (!hasSearched) return null;

  return (
    <div className="space-y-6 mt-6 px-3 sm:px-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Available Trips
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {trips.length} {trips.length === 1 ? "bus" : "buses"} found for your route
        </p>
      </div>

      {/* Trip Cards */}
      {trips.length > 0 ? (
        <div className="grid gap-4">
          {trips.map((trip, index) => (
            <Card
              key={trip._id || index}
              ref={(el) => (tripRefs.current[index] = el)}
              className="p-5 sm:p-6 hover:shadow-lg transition-all duration-300 border border-border rounded-2xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Section */}
                <div className="flex flex-col gap-4 w-full">
                  {/* Bus Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h3 className="font-semibold text-lg sm:text-xl text-foreground">
                        VIP BUSES
                      </h3>
                      <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                        {trip.busType || "Standard"}
                      </Badge>
                    </div>
                  </div>

                  {/* Trip Route Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
                    {/* Source */}
                    <div className="flex flex-col items-center sm:items-start">
                      <div className="text-2xl font-bold text-foreground">
                        {formatDateAndTime(trip.departure_time, "time")}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {trip.source || route?.source}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center my-3 sm:my-0">
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Destination */}
                    <div className="flex flex-col items-center sm:items-start">
                      <div className="text-2xl font-bold text-foreground">
                        {formatDateAndTime(trip.arrival_time, "time")}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {trip.destination || route?.destination}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider for mobile */}
                <div className="block lg:hidden border-t border-border my-3"></div>

                {/* Right Section */}
                <div className="flex flex-col items-center lg:items-end w-full lg:w-auto gap-3">
                  <div className="text-center lg:text-right">
                    <span className="flex items-center justify-center lg:justify-end text-2xl sm:text-3xl font-bold text-foreground gap-1">
                      {trip.price} EGP
                    </span>
                    <p className="text-sm text-muted-foreground">per person</p>
                  </div>

                  <Button
                    variant="default"
                    className="w-full sm:w-auto px-6 py-2 font-medium text-sm rounded-xl"
                    onClick={() => onBook(trip)}
                  >
                    Reserve Seat
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-lg py-8">
          No trips found for the selected route.
        </p>
      )}
    </div>
  );
};

export default Trips;
