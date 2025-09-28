import React, { Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Auth from "./Auth.jsx";

// Direct imports (shared across pages, should stay non-lazy)
import Navbar from "./components/navbar/nav.jsx";
import Footer from "./components/footer/footer.jsx";
import Header from "./components/landingPageNew/Header.jsx";

// Lazy-loaded components
const DriverList = lazy(() => import("./components/driverlist/driverlist.jsx"));
const Signup = lazy(() => import("./components/signup/Signup.jsx"));
const Login = lazy(() => import("./components/login/login.jsx"));
const ForgotPassword = lazy(() =>
  import("./components/forgotPassword/forgotPassword.jsx")
);
const ResetPassword = lazy(() =>
  import("./components/reset-password/reset-password.jsx")
);
const AddBus = lazy(() => import("./components/addBus/AddBus.jsx"));
const BusList = lazy(() => import("./components/busList/Buslist.jsx"));
const Homepage = lazy(() => import("./components/homePage/Homepage.jsx"));
const SeatSelection = lazy(() =>
  import("./components/seatSelection/SeatSelection.jsx")
);
const Payment = lazy(() => import("./components/payment/Payment.jsx"));
const PaymentSuccess = lazy(() =>
  import("./components/paymentSuccess/PaymentSuccess.jsx")
);
const TicketSummary = lazy(() =>
  import("./components/ticketSummary/TicketSummary.jsx")
);
const Profile = lazy(() => import("./components/Profile/profile.jsx"));
const EditBus = lazy(() => import("./components/editBus/editBus.jsx"));
const PassengersPage = lazy(() => import("./components/Passengers/Passengers.jsx"));
const BlacklistPage = lazy(() =>
  import("./components/admin-dashboard/blacklist/Blacklist.jsx")
);
const MyPayments = lazy(() =>
  import("./components/my-account/myPayments/myPayments.jsx")
);
const MyTrips = lazy(() => import("./components/my-account/MyTrips/mytrips.jsx"));
const MyBookings = lazy(() =>
  import("./components/my-account/myBookings/myBookings.jsx")
);
const History = lazy(() =>
  import("./components/admin-dashboard/history/history.jsx")
);
// const Schedule = lazy(() =>
//   import("./components/admin-dashboard/Schedule/Schedule.jsx")
// );
const AdminRoute = lazy(() =>
  import("./components/admin-dashboard/Route/route.jsx")
);
const Stops = lazy(() => import("./components/admin-dashboard/Stops/stops.jsx"));
const Bus = lazy(() => import("./components/admin-dashboard/Bus/bus.jsx"));
const AdminDashboard = lazy(() =>
  import("./components/admin-dashboard/admin-dashboard.jsx")
);
const LandingPage = lazy(() =>
  import("./components/landingPageNew/LandingPageNew.jsx")
);
const Reserve = lazy(() => import("./components/Booking/reserve.jsx"));
const UserAccount = lazy(() =>
  import("./components/my-account/user-account.jsx")
);
const Checkin = lazy(() => import("./components/check-in/checkin.jsx"));
const Paymentstatus = lazy(() =>
  import("./components/paymentstatus/Paymentstatus.jsx")
);
const TermsOfService = lazy(() => import ("./components/policies/TermsOfService.jsx"));
const PrivacyPolicy = lazy(() => import ("./components/policies/PrivacyPolicy.jsx"));

const HelpSupport = lazy(() => import ("./components/policies/help_support.jsx"))

const About = lazy (() => import("./components/policies/about.jsx"))

const RefundCancel = lazy (() =>import ("./components/policies/refund_cancel.jsx"))
const PassengersList = lazy (() =>import ("./components/admin-dashboard/passengerslist/passengers.jsx"))
const operators = lazy (()=>import("./components/admin-dashboard/operators/operators.jsx"))
function App() {
  return (
    <HashRouter basename="/">
      {/* Toasts will show up anywhere in the app */}
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Suspense fallback shown while lazy components load */}
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
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
          <Route
            path="/refund"
            element={
              <>
                <Header />
                <RefundCancel />
              </>
            }
          />
          <Route
            path="/help"
            element={
              <>
                <Header />
                <HelpSupport />
              </>
            }
          />

          <Route
            path="/about"
            element={
              <>
                <Header />
                <About />
              </>
            }
          />

          <Route
            path="/terms"
            element={
              <>
                <Header />
                <TermsOfService />
              </>
            }
          />

          <Route
            path="/privacy"
            element={
              <>
                <Header />
                <PrivacyPolicy />
              </>
            }
          />
          {/* Protected Routes */}
          <Route
            path="/operators"
            element={
              <Auth>
                <Navbar />
                <operators />
                {/* <Footer /> */}
              </Auth>
            }
          />
          <Route
            path="/passengers-list"
            element={
              <Auth>
                <Navbar />
                <PassengersList />
                {/* <Footer /> */}
              </Auth>
            }
          />

          <Route
            path="/my-account"
            element={
              <Auth>
                <Navbar />
                <UserAccount />
                {/* <Footer /> */}
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
                <PassengersPage />
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
            path="/my-payments"
            element={
              <Auth>
                <Navbar />
                <MyPayments />
                <Footer />
              </Auth>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <Auth>
                <Navbar />
                <MyBookings />
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
                {/* <Footer /> */}
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
            path="/edit-trip"
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
                <Footer />
              </Auth>
            }
          />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
