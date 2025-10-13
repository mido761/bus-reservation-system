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
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Available Trips
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {trips.length} {trips.length === 1 ? "bus" : "buses"} found for your route
        </p>
      </div>

      {/* Trip Cards */}
      {trips.length > 0 ? (
        trips.map((trip, index) => (
          <Card
            key={trip._id || index}
            ref={(el) => (tripRefs.current[index] = el)}
            className="p-6 hover:shadow-lg transition-all duration-300 border border-border rounded-2xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xl text-foreground">
                    VIP BUSES
                  </h3>
                  <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                    Standard
                  </Badge>
                </div>

                {/* Trip Route Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-center sm:text-left">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatDateAndTime(trip.departure_time, "time")}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {trip.source || route?.source}
                    </div>
                  </div>

                  {/* Arrow between source and destination */}
                  <div className="flex items-center justify-center text-muted-foreground mt-2 sm:mt-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatDateAndTime(trip.arrival_time, "time")}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {trip.destination || route?.destination}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex flex-col items-end gap-4 lg:min-w-[180px]">
                <div className="text-right">
                  <span className="flex items-center justify-end text-3xl font-bold text-foreground gap-1">
               
                    {trip.price} EGP
                  </span>
                </div>

                <Button
                  variant="default"
                  className="w-full font-medium text-sm py-2 rounded-xl"
                  onClick={() => onBook(trip)}
                >
                  Reserve Seat
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground text-lg py-8">
          No trips found for the selected route.
        </p>
      )}
    </div>
  );
};

export default Trips;
