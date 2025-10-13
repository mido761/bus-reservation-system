import React from "react";
import formatDateAndTime from "../../formatDateAndTime";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

const Trips = ({ trips, isLoading, onBook, route, hasSearched, tripRefs }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 text-lg font-medium text-muted-foreground">
        Loading trips...
      </div>
    );
  }

  if (!hasSearched) return null;

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Available Trips</h2>
          <p className="text-sm text-muted-foreground">
            {trips.length} {trips.length === 1 ? "bus found" : "buses found"} for your route
          </p>
        </div>
      </div>

      {/* Trips List */}
      {trips.length > 0 ? (
        trips.map((trip, index) => (
          <Card
            key={trip._id || index}
            ref={(el) => (tripRefs.current[index] = el)}
            className="p-6 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left Section */}
              <div className="flex-1">
                <div className="flex items-center gap-10">
                  {/* Departure */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatDateAndTime(trip.departure_time, "time")}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trip.source || route?.source}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block text-muted-foreground">
                    <Clock className="w-5 h-5" />
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatDateAndTime(trip.arrival_time, "time")}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trip.destination || route?.destination}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
                <div className="text-right">
                  <span className="text-3xl font-bold text-foreground">
                    {trip.price} EGP
                  </span>
                  <div className="text-sm text-muted-foreground">per person</div>
                </div>

                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => onBook(trip)}
                >
                  Reserve
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No trips found for this route.
        </p>
      )}
    </div>
  );
};

export default Trips;
