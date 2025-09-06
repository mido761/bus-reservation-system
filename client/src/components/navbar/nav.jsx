import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import LoadingScreen from "../loadingScreen/loadingScreen";
import Overlay from "../overlayScreen/overlay";
import InlineAuth from "../../InlineAuth";
import axios from "axios";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthorized } = InlineAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [alertFlag, setAlertFlag] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Logout handler
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${backEndUrl}/api/auth/logout`, null, {
        withCredentials: true,
      });
      console.log("Logout response:", response);
      if (response.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
          setAlertMessage("Logged out successfully");
          setAlertFlag(true);
        }, 1000);

        setTimeout(() => {
          setAlertFlag(false);
          navigate("/login");
        }, 2200);
      }
    } catch (error) {
      setTimeout(() => {
        setIsLoading(false);
        setAlertMessage("Failed to log out");
        setAlertFlag(true);
      }, 1000);

      setTimeout(() => {
        setAlertFlag(false);
      }, 2200);
      console.error("Logout failed:", error);
    }
  };

  if (location.pathname === "/login" || location.pathname === "/register")
    return null;

  return (
    <nav className="flex justify-between items-center w-full rounded-xl mt-2 p-4 bg-white shadow-lg">
      {/* Logo */}
      <h1
        className="flex items-center gap-2 text-xl font-bold cursor-pointer"
        onClick={() => navigate("/home")}
      >
        <img
          src="/gold-vip-icon-golden-sign-with-wreath-premium-vector-50461013 (1).ico"
          alt="Logo"
          className="w-8 h-8 rounded-full"
        />
        VIP Travel
      </h1>

      {/* Hamburger / Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="md:hidden">
            <span className="hamburger-icon flex flex-col gap-1">
              <span className="w-6 h-0.5 bg-black"></span>
              <span className="w-6 h-0.5 bg-black"></span>
              <span className="w-6 h-0.5 bg-black"></span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex flex-col min-w-[180px]"
        >
          {!(location.pathname === "/profile") && (
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
          )}
          {isAuthenticated && !(location.pathname === "/my-account") && (
            <DropdownMenuItem onClick={() => navigate("/my-account")}>
              My Account
            </DropdownMenuItem>
          )}
          {isAuthorized && !(location.pathname === "/admin-dashboard") && (
            <DropdownMenuItem onClick={() => navigate("/admin-dashboard")}>
              Admin Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop links */}
      <div className="hidden md:flex gap-4 items-center">
        {!(location.pathname === "/profile") && (
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            Profile
          </Button>
        )}
        {isAuthenticated && !(location.pathname === "/my-account") && (
          <Button variant="ghost" onClick={() => navigate("/my-account")}>
            My Account
          </Button>
        )}
        {isAuthorized && !(location.pathname === "/admin-dashboard") && (
          <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
            Admin Dashboard
          </Button>
        )}
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {isLoading && <LoadingScreen />}
      <Overlay
        alertFlag={alertFlag}
        alertMessage={alertMessage}
        setAlertFlag={setAlertFlag}
      />
    </nav>
  );
}
