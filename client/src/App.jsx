import React, { Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Auth from "./Auth.jsx";
import Navbar from "./components/navbar/nav.jsx";
import Footer from "./components/footer/footer.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy-loaded pages/components
const DriverList = lazy(() => import("./components/driverlist/driverlist.jsx"));
const Signup = lazy(() => import("./components/signup/Signup.jsx"));
const Login = lazy(() => import("./components/login/login.jsx"));
const ForgotPassword = lazy(() => import("./components/forgotPassword/forgotPassword.jsx"));
const ResetPassword = lazy(() => import("./components/reset-password/reset-password.jsx"));
const AddBus = lazy(() => import("./components/addBus/AddBus.jsx"));
const BusList = lazy(() => import("./components/busList/Buslist.jsx"));
const Homepage = lazy(() => import("./components/homePage/Homepage.jsx"));
const SeatSelection = lazy(() => import("./components/seatSelection/SeatSelection.jsx"));
const Payment = lazy(() => import("./components/payment/Payment.jsx"));
const PaymentSuccess = lazy(() => import("./components/paymentSuccess/PaymentSuccess.jsx"));
const TicketSummary = lazy(() => import("./components/ticketSummary/TicketSummary.jsx"));
const Profile = lazy(() => import("./components/Profile/profile.jsx"));
const EditBus = lazy(() => import("./components/editBus/editBus.jsx"));
const Passengers = lazy(() => import("./components/Passengers/Passengers.jsx"));
const BlacklistPage = lazy(() => import("./components/admin-dashboard/blacklist/Blacklist.jsx"));
const MyPayments = lazy(() => import("./components/my-account/myPayments/myPayments.jsx"));
const MyTrips = lazy(() => import("./components/my-account/MyTrips/mytrips.jsx"));
const MyBookings = lazy(() => import("./components/my-account/myBookings/myBookings.jsx"));
const History = lazy(() => import("./components/admin-dashboard/history/history.jsx"));
const AdminRoute = lazy(() => import("./components/admin-dashboard/Route/route.jsx"));
const Stops = lazy(() => import("./components/admin-dashboard/Stops/stops.jsx"));
const Bus = lazy(() => import("./components/admin-dashboard/Bus/bus.jsx"));
const AdminDashboard = lazy(() => import("./components/admin-dashboard/admin-dashboard.jsx"));
const LandingPage = lazy(() => import("./components/landingPageNew/LandingPageNew.jsx"));
const Reserve = lazy(() => import("./components/Booking/reserve.jsx"));
const UserAccount = lazy(() => import("./components/my-account/user-account.jsx"));
const Checkin = lazy(() => import("./components/check-in/checkin.jsx"));
const Paymentstatus = lazy(() => import("./components/paymentstatus/Paymentstatus.jsx"));

function App() {
  return (
    <HashRouter basename="/">
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Wrap routes in Suspense for lazy loading */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/driver-list" element={<DriverList />} />

          <Route
            path="/"
            element={
              <>
                <Navbar />
                <LandingPage />
                <Footer />
              </>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/my-account"
            element={
              <Auth>
                <Navbar />
                <UserAccount />
                <Footer />
              </Auth>
            }
          />

          <Route
            path="/home"
            element={
              <Auth>
                <Navbar />
                <Homepage />
                <Footer />
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
              </Auth>
            }
          />

          <Route
            path="/payment"
            element={
              <Auth>
                <Navbar />
                <Payment />
              </Auth>
            }
          />

          <Route
            path="/payment-status"
            element={
              <Auth>
                <Navbar />
                <Paymentstatus />
              </Auth>
            }
          />

          <Route
            path="/checkin"
            element={
              <Auth>
                <Navbar />
                <Checkin />
                <Footer />
              </Auth>
            }
          />

          <Route
            path="/reserve"
            element={
              <Auth>
                <Navbar />
                <Reserve />
              </Auth>
            }
          />

          <Route
            path="/payment-success/:selectedSeats"
            element={
              <Auth>
                <Navbar />
                <PaymentSuccess />
              </Auth>
            }
          />

          <Route
            path="/ticket-summary"
            element={
              <Auth>
                <Navbar />
                <TicketSummary />
              </Auth>
            }
          />

          {/* Add more routes as needed */}
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
