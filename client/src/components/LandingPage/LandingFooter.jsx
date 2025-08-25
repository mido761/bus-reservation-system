import React from "react";
import "./LandingFooter.css";

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <p>&copy; {new Date().getFullYear()}VIP Travel. All rights reserved.</p>
    </footer>
  );
};

export default LandingFooter;
