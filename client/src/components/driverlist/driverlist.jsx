import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingComponent from "../loadingComponent/loadingComponent";
import LoadingPage from "../loadingPage/loadingPage";
import Overlay from "../overlayScreen/overlay";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const convertTo12HourFormat = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  let period = "AM";
  let hour12 = parseInt(hour, 10);
  if (hour12 >= 12) {
    period = "PM";
    if (hour12 > 12) hour12 -= 12;
  }
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${minute} ${period}`;
};

const groupTripsByDate = (tripList) => {
  return tripList.reduce((acc, trip) => {
    const key = (trip.date || "").split("T")[0] || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(trip);
    return acc;
  }, {});
};

const DriverList = () => {
  const [tripList, setTripList] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [alertFlag, setAlertFlag] = useState(false);
  const [passengersCount, setPassengersCount] = useState({ total: 0, byRoute: {} });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchTripList = async () => {
    try {
      // fetch auth to know current user and admin privileges
      try {
        const reqUser = await axios.get(`${backEndUrl}/auth`, { withCredentials: true });
        setCurrentUserId(reqUser?.data?.userId || null);
        setIsAdmin(reqUser?.data?.userRole === "admin");
      } catch (e) {
        setCurrentUserId(null);
        setIsAdmin(false);
      }
      const response = await axios.get(`${backEndUrl}/trip/get-trips-with-counts`, { withCredentials: true });
      const trips = Array.isArray(response.data) ? response.data : [];
      const sortedTrips = trips.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return String(a.departure_time).localeCompare(String(b.departure_time));
      });
      setTripList(sortedTrips);
      if (sortedTrips.length > 0 && !selectedDate) {
        const firstDate = (sortedTrips[0].date || "").split("T")[0];
        setSelectedDate(firstDate);
      }
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setPageLoading(false);
    }
  };

  const fetchPassengersForTrip = async (tripId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backEndUrl}/booking/get-driver-list/${tripId}`, { withCredentials: true });
      const users = Array.isArray(res.data.tripBookings) ? res.data.tripBookings : [];
      setPassengers(users);
      const routeCounts = {};
      let total = users.length;
      users.forEach((p) => {
        const route = p.stop_name || "Unknown";
        routeCounts[route] = (routeCounts[route] || 0) + 1;
      });
      setPassengersCount({ total, byRoute: routeCounts });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching passengers for trip:", error);
      setPassengers([]);
      setPassengersCount({ total: 0, byRoute: {} });
      setLoading(false);
    }
  };

  const handleTripSelect = (tripId) => {
    setSelectedTripId(tripId === selectedTripId ? null : tripId);
    if (tripId !== selectedTripId) {
      fetchPassengersForTrip(tripId);
    } else {
      setPassengersCount({ total: 0, byRoute: {} });
    }
  };

  useEffect(() => {
    fetchTripList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tripsByDate = groupTripsByDate(tripList);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Sort passengers by booking time (oldest first) before filtering
  const sortedPassengers = passengers.slice().sort((a, b) => {
    // If no booked_at, don't change order
    if (!a.booked_at || !b.booked_at) return 0;
    return new Date(a.booked_at) - new Date(b.booked_at);
  });

  const filteredPassengers = sortedPassengers.filter((passenger) => {
    const query = searchQuery.toLowerCase().trim();
    const userName = (passenger?.name || passenger?.username || "").toLowerCase();
    const rawPhone = String(passenger?.phone_number || passenger?.phoneNumber || "").toLowerCase();
    const phoneNumber = (isAdmin || passenger?.user_id === currentUserId) ? rawPhone : "";
    const route = (passenger?.stop_name || passenger?.route || "").toLowerCase();
    return userName.includes(query) || phoneNumber.includes(query) || route.includes(query);
  });

  const getRowColor = (passenger) => {
    if ((passenger.status || '').toLowerCase() === 'confirmed') return '#376c37'; // green
    if ((passenger.status || '').toLowerCase() === 'waiting') return '#c0392b'; // red
    return '#fff'; // default/white
  };

  if (pageLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="w-full min-h-screen flex justify-center mt-4 gap-4">
      <Card className="max-w-sm w-full m-2 p-0">
        <CardHeader>
          <CardTitle className="text-2xl">Available Trips</CardTitle>
        </CardHeader>
        <CardContent className="max-w-sm flex gap-2 m-2 p-0">
          {Object.keys(tripsByDate).length > 0 ? (
            <div className="w-full">
              <div className="flex gap-4 mb-4 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide scroll-smooth">
                {Object.entries(tripsByDate).map(([date, trips]) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    onClick={() => setSelectedDate(date)}
                    className="justify-start h-auto py-2 px-3"
                  >
                    <div className="flex items-center gap-2 inline-block ">
                      <span>{formatDate(date)}</span>
                      <span className="text-xs text-muted-foreground">{trips.length} {trips.length === 1 ? "trip" : "trips"}</span>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  {tripsByDate[selectedDate]?.map((trip) => (
                    <Button
                      key={trip.trip_id}
                      variant={selectedTripId === trip.trip_id ? "default" : "outline"}
                      onClick={() => handleTripSelect(trip.trip_id)}
                      className="justify-start h-auto py-3 px-4"
                    >
                      <div className="text-left">
                        <div className="font-medium">{convertTo12HourFormat(trip.departure_time)}</div>
                        <div className="text-sm">{trip.source} → {trip.destination}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedTripId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {(() => {
                          const t = tripList.find((x) => x.trip_id === selectedTripId);
                          if (!t) return null;
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{t.source}</span>
                              <span>→</span>
                              <span>{t.destination}</span>
                              <span className="text-sm text-muted-foreground">{(t.date || "").split("T")[0]}</span>
                            </div>
                          );
                        })()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-3">
                        <Card className="p-4">
                          <div className="text-sm text-muted-foreground">Total Passengers</div>
                          <div className="text-2xl font-semibold">{passengersCount.total}</div>
                        </Card>
                        {Object.entries(passengersCount.byRoute).map(([route, count]) => (
                          <Card key={route} className="p-4">
                            <div className="text-sm text-muted-foreground">{route}</div>
                            <div className="text-xl font-semibold">{count}</div>
                          </Card>
                        ))}
                      </div>

                      <div className="max-w-md">
                        <Input
                          placeholder="Search by name, phone or stop"
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                      </div>

                      {loading ? (
                        <LoadingComponent />
                      ) : Array.isArray(filteredPassengers) && filteredPassengers.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table className="border border-primary-500">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Stop</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredPassengers.map((passenger, idx) => (
                                <TableRow key={idx} style={{ backgroundColor: getRowColor(passenger) }}>
                                  <TableCell>{idx + 1}</TableCell>
                                  <TableCell>{passenger.name || passenger.user_name}</TableCell>
                                  <TableCell>{(isAdmin || passenger.user_id === currentUserId) ? (passenger.user_number || passenger.phoneNumber) : ""}</TableCell>
                                  <TableCell>{passenger.stop_name}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No passengers found matching your search.</div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No trips available.</div>
          )}
        </CardContent>
      </Card>

      {alertFlag && <Overlay alertFlag={alertFlag} setAlertFlag={setAlertFlag} />}
    </div>
  );
};

export default DriverList;
