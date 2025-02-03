import React, {useEffect, useState} from "react";
import axios from "axios";
import './Buslist.css';

// import { set } from "mongoose";
const port = 3001

const BusList = () => {
    const [buses, setBuses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // const [busName, setBusName] = useState('');
    // const [busId, setBusId] = useState('');
    // const [userName, setUserName] = useState('');
    // const [seatsBooked, setSeatsBooked] = useState('');

const fetchBuses = async () => {
    const res = await axios.get(`http://localhost:${port}/buses`);
    setBuses(res.data);
    setIsLoading(false);
    console.log(res.data);
};

useEffect(() => {
    setIsLoading(true);
    fetchBuses();
}, []);

const handleDel = async (id) =>{
    try {
        await axios.delete(`http://localhost:${port}/buses/${id}`);
        setBuses(buses.filter((bus) => bus._id !== id));
        alert("Bus deleted successfully!");
    } catch (err) {
        console.log("Error deleting the bus", err)
        alert("Error deleting the bus.");
    } 
}

return (
    <>
    
    <div className="home-bus-list">
        <br /> <button onClick={() => fetchBuses()} className="button">Find Buses</button>
        <br />
        {buses.length > 0 ? (
            buses.map((bus) => (
                <div key={bus._id} className="bus-container">
                    <h1>Bus details</h1>
                    <p>Pickup location: {bus.location.pickupLocation}</p>
                    <p>Arrival location: {bus.location.arrivalLocation}</p>
                    <p>Seats: {bus.seats.totalSeats}</p>
                    <p>Price: {bus.price}</p>
                    <p>schedule: {bus.schedule}</p>
                    <p>Departure time: {bus.time.departureTime}</p>
                    <p>Arrival time: {bus.time.arrivalTime}</p>
                    <p>Minimum number of passengers: {bus.minNoPassengers}</p>
                    <p>Cancel time allowance: {bus.allowance.cancelTimeAllowance}</p>
                    <p>Booking time allowance: {bus.allowance.bookingTimeAllowance}</p>
                    <p>Allowed number of bags: {bus.allowedNumberOfBags}</p>

                    <button onClick={() => handleDel(bus._id)}>Delete Bus</button>
                </div>
                ))
            ):(
                isLoading ? <p>Loading buses...</p> : <p>No buses found.</p>
            )}
    </div>
    </>
);
};

export default BusList;