import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Trips = ({
  trips,
  isLoading,
  onBook,
  onSeePassengers,
  convertTo12HourFormat,
  route,
  hasSearched,
  tripRefs,
}) => {
  // if (!hasSearched) return null;
  if (isLoading) return <div className="trip-list-loading">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      {/* Header */}
      <div className="flex items-center gap-2 text-xl font-semibold text-indigo-900">
        <span className="text-2xl">🚌</span>
        <h2>Available Trips</h2>
      </div>

      {/* Trips */}
      {trips.length > 0 ? (
        trips.map((trip, index) => (
          <Card
            key={trip._id || index}
            ref={(el) => (tripRefs.current[index] = el)}
            className="flex flex-col items-center justify-center mb-4 md:flex-row justify-between items-start md:items-center gap-2 p-4 shadow-md"
          >
            {/* Trip Info */}
            <CardContent className="w-full flex flex-col gap-1 text-gray-700">
              <p>
                <strong>From:</strong> {trip.source || route?.source}
              </p>
              <p>
                <strong>To:</strong> {trip.destination || route?.destination}
              </p>
              <p>
                <strong>Date:</strong> {trip.date}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {convertTo12HourFormat
                  ? convertTo12HourFormat(trip.departure_time)
                  : trip.departure_time}
              </p>
            </CardContent>

            {/* Actions */}
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button variant="default" onClick={() => onBook(trip)}>
                Reserve
              </Button>
              <Button variant="outline" onClick={() => onSeePassengers(trip)}>
                Passengers List
              </Button>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-gray-500 text-center bg-background">
          {hasSearched ? "No trips found." : "Search for a trip first"}
        </p>
      )}
    </div>
  );
};

export default Trips;
