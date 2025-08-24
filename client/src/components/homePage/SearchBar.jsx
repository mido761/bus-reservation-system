import React from "react";
import "./SearchBar.css";

const SearchBar = ({ pickupPoint, arrivalPoint, date, setPickupPoint, setArrivalPoint, setDate, onSearch }) => (
  <div className="search-bar">
    <select onChange={e => setPickupPoint(e.target.value)} value={pickupPoint}>
      <option value="">Pickup Point</option>
      <option value="E-JUST">E-JUST</option>
      <option value="Cairo">Cairo</option>
    </select>
    <select onChange={e => setArrivalPoint(e.target.value)} value={arrivalPoint}>
      <option value="">Arrival Point</option>
      <option value="Cairo">Cairo</option>
      <option value="E-JUST">E-JUST</option>
    </select>
    <input type="date" onChange={e => setDate(e.target.value)} value={date} />
    <button className="search-btn" onClick={onSearch}>Search</button>
  </div>
);

export default SearchBar;
