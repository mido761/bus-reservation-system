import React from "react";
import formatDateAndTime from "../../formatDateAndTime"
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  DollarSign,
  Wifi,
  Zap,
  Coffee,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";

const rating = 4.8;
const amenities = ["wifi", "power", "coffee"];
const busType = "Standard";
const isPopular = false;
const operator = "VIP Travel";
const originalPrice = 160;
const seatsLeft = 15;

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
  // trips.trip_id,
  // trips.date,
  // trips.departure_time,
  // trips.arrival_time,
  // trips.status,
  // trips.price,
  // route.source,
  // route.destination,
  // route.distance,
  // route.estimated_duration
//  const trips = [
//     {
//       trip_id: 1,
//       source: "E-JUST",
//       destination: "Cairo",
//       departure_time: "08:30",
//       arrival_time: "13:00",
//       estimated_duration: "4h 30m",
//       price: 120,
//     },
//     // {
//     //   id: 2,
//     //   operator: "City Connect",
//     //   from: "New York",
//     //   to: "Boston",
//     //   departureTime: "14:15",
//     //   arrivalTime: "18:45",
//     //   duration: "4h 30m",
//     //   price: 38,
//     //   originalPrice: null,
//     //   seatsLeft: 8,
//     //   rating: 4.5,
//     //   amenities: ["wifi", "power"],
//     //
//     // },
//     // {
//     //   id: 3,
//     //   operator: "Comfort Cruise",
//     //   from: "New York",
//     //   to: "Boston",
//     //   departureTime: "20:30",
//     //   arrivalTime: "01:15",
//     //   duration: "4h 45m",
//     //   price: 52,
//     //   originalPrice: 62,
//     //   seatsLeft: 15,
//     //   rating: 4.9,
//     //   amenities: ["wifi", "power", "coffee"],
//     //   busType: "Luxury",
//     //   isPopular: false,
//     // },
//     // {
//     //   id: 4,
//     //   operator: "Budget Bus",
//     //   from: "New York",
//     //   to: "Boston",
//     //   departureTime: "06:00",
//     //   arrivalTime: "10:45",
//     //   duration: "4h 45m",
//     //   price: 32,
//     //   originalPrice: null,
//     //   seatsLeft: 20,
//     //   rating: 4.2,
//     //   amenities: ["wifi"],
//     //   busType: "Economy",
//     //   isPopular: false,
//     // },
//   ]; 

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "power":
        return <Zap className="w-4 h-4" />;
      case "coffee":
        return <Coffee className="w-4 h-4" />;
      default:
        return null;
    }
  };
  // if (!hasSearched) return null;
  if (isLoading) return <div className="trip-list-loading">Loading...</div>;

  return (
    <div className="space-y-4 m-4">
      {/* Header */}
      {/* <div className="flex items-center gap-2 text-xl font-semibold text-indigo-900">
        <span className="text-2xl">🚌</span>
        <h2>Available Trips</h2>
      </div> */}

      <div className="flex items-center text-center justify-between mb-6">
        <div className="w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold text-foreground">
            Available Trips
          </h2>
          <p className="text-muted-foreground">
            <strong>{trips.length}</strong> buses found for your route
          </p>
        </div>
        {/* <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select className="px-3 py-1 bg-background border border-input rounded-md text-sm">
            <option>Price (Low to High)</option>
            <option>Departure Time</option>
            <option>Duration</option>
            <option>Rating</option>
          </select>
        </div> */}
      </div>

      {trips.map((trip, index) => (
        <Card
          key={trip.id || index}
          ref={(el) => (tripRefs.current[index] = el)}
          className="p-6 hover:shadow-medium transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Section - Trip Details */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground">
                    {operator}
                  </h3>
                  {trip.isActive && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Active
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {busType}
                  </Badge>
                </div>
                {/* <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating}</span>
                </div> */}
              </div>

              {/* Route and Time */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {formatDateAndTime(trip.departure_time, "time")}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.source}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-px bg-border flex-1"></div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                      <Clock className="w-3 h-3" />
                      {trip.estimated_duration + "h" || "3h 30m"}
                    </div>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {formatDateAndTime(trip.arrival_time, "time")}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.destination}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {/* <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
                    >
                      {getAmenityIcon(amenity)}
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {seatsLeft} seats booked
                </div>
              </div> */}
            </div>

            {/* Right Section - Price and Booking */}
            <div className="flex flex-col items-end gap-4 lg:min-w-[200px]">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      <span className="text-sm">EGP</span> {originalPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-foreground flex items-center gap-1">
                    <span className="text-sm">EGP</span> {trip.price}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">per person</div>
                {originalPrice && (
                  <div className="text-sm text-green-600 font-medium">
                    Save <span className="text-sm">EGP</span> {originalPrice - trip.price}
                  </div>
                )}
              </div>

              {/* Actions */}
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
      ))}

      {/* Trips */}
    </div>
  );
};

export default Trips;
// {trips.length > 0 ? (
//   trips.map((trip, index) => (
//     <Card
//       key={trip._id || index}
//       ref={(el) => (tripRefs.current[index] = el)}
//       className="flex flex-col items-center justify-center mb-4 md:flex-row justify-between items-start md:items-center gap-2 p-4 shadow-md"
//     >
//       {/* Trip Info */}
//       <CardContent className="w-full flex flex-col gap-1 text-gray-700">
//         <p>
//           <strong>From:</strong> {trip.source || route?.source}
//         </p>
//         <p>
//           <strong>To:</strong> {trip.destination || route?.destination}
//         </p>
//         <p>
//           <strong>Date:</strong> {trip.date}
//         </p>
//         <p>
//           <strong>Time:</strong>{" "}
//           {convertTo12HourFormat
//             ? convertTo12HourFormat(trip.departure_time)
//             : trip.departure_time}
//         </p>
//       </CardContent>

//       {/* Actions */}
//       <div className="flex gap-2 mt-2 md:mt-0">
//         <Button variant="default" onClick={() => onBook(trip)}>
//           Reserve
//         </Button>
//         <Button variant="outline" onClick={() => onSeePassengers(trip)}>
//           Passengers List
//         </Button>
//       </div>
//     </Card>
//   ))
// ) : (
//   <p className="text-gray-500 text-center bg-background">
//     {hasSearched ? "No trips found." : "Search for a trip first"}
//   </p>
// )}
