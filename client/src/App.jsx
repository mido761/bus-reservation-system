import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import authen from "./authent.jsx";

//from components
import Navbar from "./components/navbar/nav.jsx";
import Signup from "./components/signup/Signup.jsx";
import Login from "./components/login/login.jsx";
import AddBus from "./components/addBus/AddBus.jsx";
import BusList from "./components/busList/Buslist.jsx";
import Homepage from "./components/homePage/Homepage.jsx";
import SeatSelection from "./components/seatSelection/SeatSelection.jsx";
import Payment from "./components/payment/Payment.jsx";
import PaymentSuccess from "./components/paymentSuccess/PaymentSuccess.jsx";
import TicketSummary from "./components/ticketSummary/TicketSummary.jsx"; // Import TicketSummary component
import Profile from "./components/Profile/profile.jsx";
import Footer from "./components/footer/footer.jsx";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/home" element={<Homepage />}></Route>
        <Route
          path="/seat-selection/:busId"
          element={<SeatSelection />}
        ></Route>
        <Route path="/payment/:selectedSeats" element={<Payment />} />
        <Route
          path="/payment-success/:selectedSeats"
          element={<PaymentSuccess />}
        />
        <Route
          path="/ticket-summary/:selectedSeats"
          element={<TicketSummary />}
        />
        <Route path="/authen" element={<authen />}></Route>

        <Route path="/add-bus" element={<AddBus />}></Route>
        <Route path="/buses" element={<BusList />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
