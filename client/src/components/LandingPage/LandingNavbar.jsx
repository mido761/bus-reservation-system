import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";  // ✅ import toast
import "./LandingNavbar.css";

const LandingNavbar = () => {
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
  const authToken = sessionStorage.getItem("authToken");

  if (!authToken) {
    e.preventDefault();
    toast.warn("You must log in to access Home!");
    setTimeout(() => {
      navigate("/login");
    }, 2500); 
  } else {
    navigate("/home");
  }
};


  return (
    <nav className="landing-navbar">
      <div className="logo">
        <img
          src="/gold-vip-icon-golden-sign-with-wreath-premium-vector-50461013 (1).ico"
          alt="VIP Logo"
          className="logo-icon"
        />
        <span className="logo-text">
          <strong>VIP</strong>
          <span className="light">Travel</span>
        </span>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/home" onClick={handleHomeClick}>Home</Link>
        </li>
        <li>
          <Link to="/login">Log In</Link>
        </li>
      </ul>
    </nav>
  );
};

export default LandingNavbar;
