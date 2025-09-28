import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDateTime from "../../formatDateAndTime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Reserve = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, route } = location.state || {};
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [bookingError, setBookingError] = useState("");

  // Api call (fetch stops)
  const fetchStops = async () => {
    try {
      const res = await axios.get(
        `${backEndUrl}/stop/get-stops-route/${route?.route_id}`
      );
      setStops(res.data.stops);
    } catch (err) {
      setStops([]);
    }
  };

  useEffect(() => {
    if (route?.route_id) fetchStops();
  }, [route?.route_id]);

  // Navigate to Payment page
  const handleGoToPayment = () => {
    if (!selectedStop) {
      setBookingError("Please select a stop before continuing.");
      return;
    }
    setBookingError("");
    navigate("/payment", {
      state: {
        trip,
        route,
        selectedStop,
      },
    });
  };

  return (
    <div className="flex items-center justify-center w-full m-auto">
      <Card className="w-full max-w-sm md:max-w-xl mx-auto p-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          {trip ? (
            <>
              {/* Trip details */}
              <div className="mb-4 space-y-1">
                <div>
                  <strong>Route:</strong> {route.source} → {route.destination}
                </div>
                <div>
                  <strong>Date:</strong> {formatDateTime(trip.date, "date")}
                </div>
                <div>
                  <strong>Departure:</strong>{" "}
                  {formatDateTime(trip.departure_time)}
                </div>
                <div>
                  <strong>Arrival:</strong> {formatDateTime(trip.arrival_time)}
                </div>
              </div>

              {/* Stops */}
              <div className="mb-4">
                <h2 className="font-semibold mb-2">Select a stop:</h2>
                <div className="grid grid-cols-2 gap-2">
                  {stops.map((stop) => (
                    <Button
                      key={stop.stop_id}
                      variant={
                        selectedStop?.stop_id === stop.stop_id
                          ? "secondary"
                          : "outline"
                      }
                      className="w-full flex items-center gap-2"
                      onClick={() => setSelectedStop(stop)}
                    >
                      🚌
                      <span className="font-semibold">{stop.stop_name}</span>
                    </Button>
                  ))}
                </div>

                {selectedStop && (
                  <div className="mt-2 flex items-center gap-2 text-center">
                    ✅
                    <pre>
                      You selected:{" "}
                      <strong className="text-blue-400">
                        {selectedStop.stop_name}
                      </strong>
                    </pre>
                  </div>
                )}

                {bookingError && (
                  <pre className="text-destructive mt-2 text-xs text-center">
                    {bookingError}
                  </pre>
                )}
              </div>

              <Button className="w-full mt-2" onClick={handleGoToPayment}>
                Complete
              </Button>
            </>
          ) : (
            <div className="text-center text-destructive">
              No trip selected.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reserve;
