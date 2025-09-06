// import React, { useEffect, useState, useRef } from "react";
// import Overlay from "../overlayScreen/overlay";
// import axios from "axios";
// import "../navbar/nav.css";
// import { useLocation, useNavigate } from "react-router-dom";
// import LoadingScreen from "../loadingScreen/loadingScreen";
// import InlineAuth from "../../InlineAuth";

// const backEndUrl = import.meta.env.VITE_BACK_END_URL;

// function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(false);
//   const [alertFlag, setAlertFlag] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const dropdownRef = useRef(null); // Reference to the nav menu (dropdown)
//   const navbarRef = useRef(null); // Reference to the navbar (optional if you need it for additional checks)
//   // const [isAuthenticated, setIsAuthenticated] = useState(null);
//   // const [isAuthorized, setIsLoading] = useState(null);

//   const { isAuthenticated, isAuthorized } = InlineAuth();

//   // Function to toggle the menu
//   const toggleMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   // Logout handler
//   const handleLogout = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.post(`${backEndUrl}/api/auth/logout`, null, {
//         withCredentials: true,
//       });
//       console.log("Logout response:", response);
//       if (response.status === 200) {
//         setTimeout(() => {
//           setIsLoading(false);
//           setAlertMessage("Logged out successfully");
//           setAlertFlag(true);
//         }, 1000);

//         setTimeout(() => {
//           setAlertFlag(false);
//           navigate("/login");
//         }, 2200);
//       }
//     } catch (error) {
//       setTimeout(() => {
//         setIsLoading(false);
//         setAlertMessage("Failed to log out");
//         setAlertFlag(true);
//       }, 1000);

//       setTimeout(() => {
//         setAlertFlag(false);
//       }, 2200);
//       console.error("Logout failed:", error);
//     }
//   };

//   // Close the dropdown if clicked outside of it
//   const handleClickOutside = (event) => {
//     if (
//       dropdownRef.current &&
//       !dropdownRef.current.contains(event.target) &&
//       navbarRef.current &&
//       !navbarRef.current.contains(event.target)
//     ) {
//       setIsOpen(false); // Close the dropdown
//     }
//   };

//   // Add event listener to detect click outside when the component mounts
//   useEffect(() => {
//     document.addEventListener("click", handleClickOutside);

//     // Cleanup event listener when the component unmounts
//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   return location.pathname === "/login" ||
//     location.pathname === "/register" ? null : (
//     <nav ref={navbarRef} className="navbar">
//       <h1 className="company-title" onClick={() => navigate("/home")}>
//         <img
//           src="/gold-vip-icon-golden-sign-with-wreath-premium-vector-50461013 (1).ico"
//           href="/gold-vip-icon-golden-sign-with-wreath-premium-vector-50461013 (1).ico"
//           className="logo"
//         />
//         VIP Travel
//       </h1>
//       <div
//         className={`ham-icon ${isOpen ? "active" : ""}`}
//         onClick={() => toggleMenu()}
//       >
//         <div className="line"></div>
//         <div className="line"></div>
//         <div className="line"></div>
//       </div>
//       <div ref={dropdownRef} className={`nav-menu ${isOpen ? "active" : ""}`}>
//         {!(location.pathname === "/profile") && (
//           <button
//             id="profile-btn"
//             className="nav-link"
//             onClick={() => navigate("/profile")}
//           >
//             Profile
//           </button>
//         )}
//         {!(location.pathname === "/my-account") && isAuthenticated && (
//           <button className="nav-link" onClick={() => navigate("/my-account")}>
//             My Account
//           </button>
//         )}

//         {/* {!(location.pathname === "/my-trips") && (
//           <button className="nav-link" onClick={() => navigate("/my-trips")}>
//             My Trips
//           </button>
//         )} */}

//         {/* {!(location.pathname === "/my-payments") && (
//           <button className="nav-link" onClick={() => navigate("/my-payments")}>
//             My Payments
//           </button>
//         )} */}

//         {!(location.pathname === "/admin-dashboard") && isAuthorized && (
//           <button
//             className="nav-link"
//             onClick={() => navigate("/admin-dashboard")}
//           >
//             Admin Dashboard
//           </button>
//         )}
//         {/* {!(location.pathname === "/history") && isAuthorized && (
//           <button className="nav-link" onClick={() => navigate("/history")}>
//             History
//           </button>
//         )} */}

//         {/* {!(location.pathname === "/form") && isAuthorized && (
//           <button className="nav-link" onClick={() => navigate("/form")}>
//             Forms
//           </button>
//         )} */}
//         {/* 
//         {!(location.pathname === "/add-bus") && isAuthorized && (
//           <button className="nav-link" onClick={() => navigate("/add-bus")}>
//             Add bus
//           </button>
//         )} */}

//         {/* {!(location.pathname === "/my-bookings") && isAuthenticated && (
//           <button className="nav-link" onClick={() => navigate("/my-bookings")}>
//             My Bookings
//           </button>
//         )} */}

//         {/* {!(location.pathname === "/black-list") && isAuthorized && (
//           <button className="nav-link" onClick={() => navigate("/black-list")}>
//             Black-list
//           </button>
//         )} */}
//         <button id="logout-btn" className="nav-link" onClick={handleLogout}>
//           Logout
//         </button>
//       </div>

//       {isLoading && <LoadingScreen />}

//       <Overlay
//         alertFlag={alertFlag}
//         alertMessage={alertMessage}
//         setAlertFlag={setAlertFlag}
//       />
//     </nav>
//   );
// }

// export default Navbar;
