import React, {useState, useEffect} from "react";
import axios from 'axios';
// import "../App.css";
import './AddBus.css';
const backEndUrl = import.meta.env.VITE_BACK_END_URL

const port = 3001
const AddBus = () => {
    const [totalSeats, setAllSeats] = useState('');
    const [schedule, setSchedule] = useState('');
    const [minNoPassengers, setMinNoPassengers] = useState('');
    const [price, setPrice] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [arrivalLocation, setArrivalLocation] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [cancelTimeAllowance, setCancelTimeAllowance] = useState('');
    const [bookingTimeAllowance, setBookingTimeAllowance] = useState('');
    const [allowedNumberOfBags, setAllowedNumberOfBags] = useState('');
    const [next, setNext] = useState(false);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.get(`${backEndUrl}/buses`);
            const buses = res.data;

            await axios.post(`${backEndUrl}/buses`, {totalSeats, schedule, minNoPassengers, price, pickupLocation, 
                arrivalLocation, departureTime, arrivalTime, cancelTimeAllowance, 
                bookingTimeAllowance, allowedNumberOfBags});
            alert('Bus added successfully');
        } catch (err) {
            alert(err.response.data.message);
            console.log(err);
        }
    }

    return (
        <div className="add-bus-page">
        <form onSubmit={handleSubmit} className="add-bus">
            <h1>Add a new Bus</h1>
            {!next ?
            (<div>
                <label htmlFor="">Pickup location</label>
                <input type="text" placeholder="Starting point" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
            
                <label htmlFor="">Arrival location</label>
                <input type="text" placeholder="End point" value={arrivalLocation} onChange={(e) => setArrivalLocation(e.target.value)} />
                
                <label htmlFor="">Departure time</label>
                <input type="number" placeholder="Leaving time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
                
                <label htmlFor="">Arrival time</label>
                <input type="number" placeholder="Arrival time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
                
                <label htmlFor="">Price</label>
                <input type="number" placeholder="Trip Price" value={price} onChange={(e) => setPrice(e.target.value)} />
                
                <label htmlFor="">Min No. passengers</label>
                <input type="number" placeholder="Minimium Number of passengers" value={minNoPassengers} onChange={(e) => setMinNoPassengers(e.target.value)} />
                <div className="next-btn" onClick={() => setNext(true)}>→</div>           
            </div>
           
            ):(<div>
                <label htmlFor="">Allowed Number Of Bags</label>
                <input type="number" placeholder="Allowed Number Of Bags" value={allowedNumberOfBags} onChange={(e) => setAllowedNumberOfBags(e.target.value)} />
                
                <label htmlFor="">Booking Time Allowance</label>
                <input type="number" placeholder="Booking Time Allowance" value={bookingTimeAllowance} onChange={(e) => setBookingTimeAllowance(e.target.value)} />
                
                <label htmlFor="">Cancel Time Allowance</label>
                <input type="number" placeholder="Cancel Time Allowance" value={cancelTimeAllowance} onChange={(e) => setCancelTimeAllowance(e.target.value)} />
                
                <label htmlFor="">Total Seats</label>
                <input type="number" placeholder="Total Number of Seats" value={totalSeats} onChange={(e) => setAllSeats(e.target.value)} />
                
                <label htmlFor="">Schedule</label>
                <input type="date" placeholder="Schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
                <div className="form-navigation">
                    <div className="back-btn" onClick={() => setNext(false)}>←</div>           
                    <button type="submit">Add Bus</button>                        
                </div>
                
            </div>)
    }      
        
        </form>
        </div>
    );
};

export default AddBus;
