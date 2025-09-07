import React from "react";
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
  ArrowRight
} from "lucide-react";

const trips = [
  {
    id: 1,
    operator: "Express Lines",
    from: "New York",
    to: "Boston",
    departureTime: "08:30",
    arrivalTime: "13:00",
    duration: "4h 30m",
    price: 45,
    originalPrice: 55,
    seatsLeft: 12,
    rating: 4.8,
    amenities: ["wifi", "power", "coffee"],
    busType: "Premium",
    isPopular: true
  },
  {
    id: 2,
    operator: "City Connect",
    from: "New York",
    to: "Boston",
    departureTime: "14:15",
    arrivalTime: "18:45",
    duration: "4h 30m",
    price: 38,
    originalPrice: null,
    seatsLeft: 8,
    rating: 4.5,
    amenities: ["wifi", "power"],
    busType: "Standard",
    isPopular: false
  },
  {
    id: 3,
    operator: "Comfort Cruise",
    from: "New York",
    to: "Boston",
    departureTime: "20:30",
    arrivalTime: "01:15",
    duration: "4h 45m",
    price: 52,
    originalPrice: 62,
    seatsLeft: 15,
    rating: 4.9,
    amenities: ["wifi", "power", "coffee"],
    busType: "Luxury",
    isPopular: false
  },
  {
    id: 4,
    operator: "Budget Bus",
    from: "New York",
    to: "Boston",
    departureTime: "06:00",
    arrivalTime: "10:45",
    duration: "4h 45m",
    price: 32,
    originalPrice: null,
    seatsLeft: 20,
    rating: 4.2,
    amenities: ["wifi"],
    busType: "Economy",
    isPopular: false
  }
];

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

const TripCards = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Available Trips</h2>
          <p className="text-muted-foreground">{trips.length} buses found for your route</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select className="px-3 py-1 bg-background border border-input rounded-md text-sm">
            <option>Price (Low to High)</option>
            <option>Departure Time</option>
            <option>Duration</option>
            <option>Rating</option>
          </select>
        </div>
      </div>

      {trips.map((trip) => (
        <Card key={trip.id} className="p-6 hover:shadow-medium transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Section - Trip Details */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground">{trip.operator}</h3>
                  {trip.isPopular && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Popular
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {trip.busType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{trip.rating}</span>
                </div>
              </div>

              {/* Route and Time */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{trip.departureTime}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.from}
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-px bg-border flex-1"></div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                      <Clock className="w-3 h-3" />
                      {trip.duration}
                    </div>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{trip.arrivalTime}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.to}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {trip.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {getAmenityIcon(amenity)}
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {trip.seatsLeft} seats left
                </div>
              </div>
            </div>

            {/* Right Section - Price and Booking */}
            <div className="flex flex-col items-end gap-4 lg:min-w-[200px]">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {trip.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${trip.originalPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-foreground flex items-center gap-1">
                    <DollarSign className="w-6 h-6" />
                    {trip.price}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">per person</div>
                {trip.originalPrice && (
                  <div className="text-sm text-green-600 font-medium">
                    Save ${trip.originalPrice - trip.price}
                  </div>
                )}
              </div>
              
              <Button 
                size="lg" 
                className="w-full lg:w-auto px-8"
                disabled={trip.seatsLeft === 0}
              >
                {trip.seatsLeft === 0 ? "Sold Out" : "Select Seats"}
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Load More */}
      <div className="flex justify-center pt-6">
        <Button variant="outline" size="lg">
          Load More Results
        </Button>
      </div>
    </div>
  );
};

export default TripCards;