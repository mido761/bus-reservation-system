import React from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import "./landingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <LandingNavbar />
      <main className="landing-content">
        <div className="hero-text">
          <h1>Welcome to VIP Travel</h1>
          <p>Book your Trips easily and quickly with easily steps.</p>
          <div className="action-buttons">
            <button className="btn primary" onClick={() => navigate("/login")}>
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
