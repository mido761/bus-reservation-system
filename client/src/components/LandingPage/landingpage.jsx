import React from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import "./landingpage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleBookNowClick = () => {
    const authToken = sessionStorage.getItem("authToken");
    if (authToken) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="landing-page">
      <LandingNavbar />
      <main className="landing-content">
        <div className="hero-text">
          <h1>Welcome to VIP Travel</h1>
          <p>Book your Trips easily and quickly with easily steps.</p>
          <div className="action-buttons">
            <button className="btn primary" onClick={handleBookNowClick}>
              Book Now
            </button>
            <button className="btn secondary" onClick={() => navigate("/register")}>
              Sign Up
            </button>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
