import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "./utils";

const TripList = ({ trips, selectedTrip, onTripSelect, error }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calendar className="w-6 h-6 text-blue-600" /> Select Trip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card
              key={trip.trip_id}
              onClick={() => onTripSelect(trip)}
              className={`cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
                selectedTrip?.trip_id === trip.trip_id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {trip.source} → {trip.destination}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      trip.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{formatDate(trip.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>
                      {trip.departure_time} - {trip.arrival_time}
                    </span>
                  </div>
                 
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{trip.price} EGP</p>
                  
                  </div>
                  {/* <Button
                    variant={selectedTrip?.trip_id === trip.trip_id ? "default" : "outline"}
                    size="sm"
                  >
                    {selectedTrip?.trip_id === trip.trip_id ? "Selected" : "Select Trip"}
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripList;
