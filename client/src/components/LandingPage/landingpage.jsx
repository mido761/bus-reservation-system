import React from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import Hero from "../homePage/Hero";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen">
      {/* <LandingNavbar /> */}
      <main className="flex flex-col justify-start gap-10 bg-backgound p-4">
        <Hero />
        <div className="flex flex-col gap-4">
          <Button onClick={handleBookNowClick}>Book Now</Button>
          <Button variant="outline" onClick={() => navigate("/register")}>
            Sign Up
          </Button>
        </div>
      </main>
      {/* <LandingFooter /> */}
    </div>
  );
};

export default LandingPage;
