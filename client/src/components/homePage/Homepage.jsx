import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";
import Hero from "./Hero";
import SearchBar from "./SearchBar";
import PopularRoutes from "./PopularRoutes";
import BusList from "./Trips";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const Homepage = () => {
  const navigate = useNavigate();
  const [pickupPoint, setPickupPoint] = useState("");
  const [arrivalPoint, setArrivalPoint] = useState("");
  const [date, setDate] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const popularRoutes = [
    { id: 1, route: "Cairo to E-JUST" },
    { id: 2, route: "E-JUST to Cairo" },
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    setFilteredBuses([]);
    try {
      const res = await axios.get(`${backEndUrl}/form`);
      if (Array.isArray(res.data)) {
        const filtered = res.data.filter(
          (bus) =>
            bus.location.pickupLocation === pickupPoint &&
            bus.location.arrivalLocation === arrivalPoint &&
            bus.schedule === date
        );
        setFilteredBuses(filtered);
      }
    } catch (error) {
      setFilteredBuses([]);
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

  return (
    <div className="home-page">
      <Hero />
      <SearchBar
        pickupPoint={pickupPoint}
        arrivalPoint={arrivalPoint}
        date={date}
        setPickupPoint={setPickupPoint}
        setArrivalPoint={setArrivalPoint}
        setDate={setDate}
        onSearch={handleSearch}
      />
      <PopularRoutes routes={popularRoutes} onSelect={handleRouteSelect} />
      <BusList
        buses={filteredBuses}
        isLoading={isLoading}
        onSeePassengers={() => {}}
        onBook={() => {}}
        convertTo12HourFormat={convertTo12HourFormat}
      />
    </div>
  );
};

export default Homepage;
