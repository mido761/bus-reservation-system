import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";
import Hero from "../landingPageNew/Hero";
import SearchBar from "./SearchBar";
import PopularRoutes from "./PopularRoutes";
import Trips from "./Trips";
import AdditionalInfo from "./AdditionalInfo";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Homepage = () => {
  const navigate = useNavigate();
  const [pickupPoint, setPickupPoint] = useState("");
  const [arrivalPoint, setArrivalPoint] = useState("");
  const [date, setDate] = useState("");
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allRoutes, setAllRoutes] = useState([]);
  const [route, setroute] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const tripRefs = useRef([]);

  const popularRoutes = [
    { id: 1, route: "Cairo to E-JUST" },
    { id: 2, route: "E-JUST to Cairo" },
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    setFilteredTrips([]);
    setHasSearched(true);
    try {
      const route = allRoutes.find(
        (r) => r.source === pickupPoint && r.destination === arrivalPoint
      );
      console.log(route);
      if (!route) {
      }
      setroute(route);

      const res = await axios.post(`${backEndUrl}/trip/get-trip`, {
        routeId: route.route_id,
        date: date,
      });
      // if (Array.isArray(res.data.data)) {
      //   const filtered = res.data.data.filter(
      //     (trip) =>
      //       trip.route_id === route.route_id &&
      //       trip.date === date
      //   );
      //   console.log(filtered)
      // setFilteredTrips(filtered);
      //   }
      setFilteredTrips(res.data.data);
    } catch (error) {
      setFilteredTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = (route) => {
    const [pickup, arrival] = route.split(" to ");
    setPickupPoint(pickup);
    setArrivalPoint(arrival);
    setTimeout(handleSearch, 0);
  };

  const convertTo12HourFormat = (time) => {
    if (!time || !time.includes(":")) return "";
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

  useEffect(() => {
    if (filteredTrips.length > 0) {
      tripRefs.current[0]?.scrollIntoView({ behavior: "smooth" }); // scroll to first trip
    }
  }, [filteredTrips]);

  return (
    <div className="flex flex-col items-center justify-start gap-8">
      <Hero
        pickupPoint={pickupPoint}
        arrivalPoint={arrivalPoint}
        date={date}
        setPickupPoint={setPickupPoint}
        setArrivalPoint={setArrivalPoint}
        setDate={setDate}
        onSearch={handleSearch}
        setAllRoutes={setAllRoutes}
      />
      {/* <div className="flex flex-col items-center justify-center gap-7 m-4"> */}
        {/* <SearchBar
          pickupPoint={pickupPoint}
          arrivalPoint={arrivalPoint}
          date={date}
          setPickupPoint={setPickupPoint}
          setArrivalPoint={setArrivalPoint}
          setDate={setDate}
          onSearch={handleSearch}
          setAllRoutes={setAllRoutes}
        /> */}
        {/* <PopularRoutes routes={popularRoutes} onSelect={handleRouteSelect} /> */}
        {filteredTrips.length > 0 && (
          <Trips
            trips={filteredTrips}
            isLoading={isLoading}
            onSeePassengers={() => {}}
            onBook={(trip) => {
              navigate("/reserve", {
                state: {
                  trip,
                  route,
                },
              });
            }}
            convertTo12HourFormat={convertTo12HourFormat}
            route={route}
            hasSearched={hasSearched}
            tripRefs={tripRefs}
          />
        )}
      {/* </div> */}

      {/* Additional Information */}
      <AdditionalInfo />
    </div>
  );
};

export default Homepage;
