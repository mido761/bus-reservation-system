import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchBar.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

const SearchBar = ({
  pickupPoint, arrivalPoint, date,
  setPickupPoint, setArrivalPoint, setDate, onSearch, setAllRoutes   
}) => {
  const [pickupOptions, setPickupOptions] = useState([]);
  const [arrivalOptions, setArrivalOptions] = useState([]);


  useEffect(() => {
    axios.get(`${backEndUrl}/route/get-routes`)
      .then(res => {
        const routes = res.data || [];
        setPickupOptions([...new Set(routes.map(r => r.source))]);
        setArrivalOptions([...new Set(routes.map(r => r.destination))]);
        setAllRoutes(routes)
      })
      .catch(() => {
        setPickupOptions([]);
        setArrivalOptions([]);
      });
  }, []);

  return (
    <div className="search-bar">
      <select onChange={e => setPickupPoint(e.target.value)} value={pickupPoint}>
        <option value="">Pickup Point</option>
        {pickupOptions.map((pickup, idx) => (
          <option key={idx} value={pickup}>{pickup}</option>
        ))}
      </select>
      <select onChange={e => setArrivalPoint(e.target.value)} value={arrivalPoint}>
        <option value="">Arrival Point</option>
        {arrivalOptions.map((arrival, idx) => (
          <option key={idx} value={arrival}>{arrival}</option>
        ))}
      </select>
      <input type="date" onChange={e => setDate(e.target.value)} value={date} />
      <button className="search-btn" onClick={onSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
