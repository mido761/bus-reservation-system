import "./App.css";
// import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Auth from "./Auth.jsx";

// Import components
import DriverList from "./components/driverlist/driverlist.jsx";
import Navbar from "./components/navbar/nav.jsx";
import Signup from "./components/signup/Signup.jsx";
import Login from "./components/login/login.jsx";
import ForgotPassword from "./components/forgotPassword/forgotPassword.jsx";
import ResetPassword from "./components/reset-password/reset-password.jsx";
import AddBus from "./components/addBus/AddBus.jsx";
import BusList from "./components/busList/Buslist.jsx";
import Homepage from "./components/homePage/Homepage.jsx";
import SeatSelection from "./components/seatSelection/SeatSelection.jsx";
import Payment from "./components/payment/Payment.jsx";
import PaymentSuccess from "./components/paymentSuccess/PaymentSuccess.jsx";
import TicketSummary from "./components/ticketSummary/TicketSummary.jsx";
import Profile from "./components/Profile/profile.jsx";
import Footer from "./components/footer/footer.jsx";
import EditBus from "./components/editBus/editBus.jsx";
import Passengers from "./components/Passengers/Passengers";
import BlacklistPage from "./components/admin-dashboard/blacklist/Blacklist.jsx";
import MyTrips from "./components/MyTrips/mytrips.jsx";
import History from "./components/admin-dashboard/history/history.jsx";
// import Schedule from "./components/admin-dashboard/Schedule/Schedule.jsx";
import AdminRoute from "./components/admin-dashboard/Route/route.jsx";
import Stops from "./components/admin-dashboard/Stops/stops.jsx";
import Bus from "./components/admin-dashboard/Bus/bus.jsx";
import AdminDashboard from "./components/admin-dashboard/admin-dashboard.jsx";
import LandingPage from "./components/LandingPage/landingpage.jsx";
import { ToastContainer } from "react-toastify";             
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <HashRouter basename="/">
      {/* Toasts will show up anywhere in the app */}
        <ToastContainer position="top-center" autoClose={2000} />
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/driver-list" element={<DriverList />} />
        <Route path="/" element={<LandingPage />} />
        


        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <Auth>
              <Navbar />
              <Homepage />
              <Footer /> {/* Footer is only shown when logged in */}
            </Auth>
          }
        />

        <Route
          path="/passengers"
          element={
            <Auth>
              <Navbar />
              <Passengers />
            </Auth>
          }
        />
        <Route
          path="/seat-selection/:busId"
          element={
            <Auth>
              <Navbar />
              <SeatSelection />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/payment/:selectedSeats"
          element={
            <Auth>
              <Navbar />
              <Payment />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/payment-success/:selectedSeats"
          element={
            <Auth>
              <Navbar />
              <PaymentSuccess />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/ticket-summary/:selectedSeats"
          element={
            <Auth>
              <Navbar />
              <TicketSummary />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/add-bus"
          element={
            <Auth requireAdmin={true}>
              <Navbar />
              <AddBus />
              <Footer />
            </Auth>
          }
        />


        <Route
          path="/my-trips"
          element={
            <Auth>
              <Navbar />
              <MyTrips />
              <Footer />
            </Auth>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <Auth requireAdmin={true}>
              <Navbar />
              <AdminDashboard />
              <Footer />
            </Auth>
          }
        />
        <Route
          path="/route"
          element={
            <Auth>
              <Navbar />
              <AdminRoute />
            <Footer />
          </Auth>
          }
        />
        <Route
          path="/stops"
          element={
            <Auth>
              <Navbar />
              <Stops />
              <Footer />
            </Auth>
          }
        />
        <Route
          path="/bus"
          element={
            <Auth>
              <Navbar />
              <Bus />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/history"
          element={
            <Auth>
              <Navbar />
              <History />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/black-list"
          element={
            <Auth requireAdmin={true}>
              <Navbar />
              <BlacklistPage />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/form"
          element={
            <Auth requireAdmin={true}>
              <Navbar />
              <BusList />
              <Footer />
            </Auth>
          }
        />
        <Route
          path="/edit-form/:busId"
          element={
            <Auth requireAdmin={true}>
              <Navbar />
              <EditBus />
              <Footer />
            </Auth>
          }
        />

        <Route
          path="/profile"
          element={
            <Auth>
              <Navbar />
              <Profile />
              {/* <Footer /> */}
            </Auth>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
