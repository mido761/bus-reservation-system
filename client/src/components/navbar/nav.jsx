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
import Header from "../landingPageNew/Header";
import LoadingScreen from "../loadingScreen/loadingScreen";
import InlineAuth from "../../InlineAuth";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backEndUrl = import.meta.env.VITE_BACK_END_URL;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthorized } = InlineAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${backEndUrl}/api/auth/logout`, null, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
          toast.success("Logged out successfully", {
            position: "top-center",
            autoClose: 2000,
          });
        }, 1000);

        setTimeout(() => {
          navigate("/login");
        }, 2200);
      }
    } catch (error) {
      setTimeout(() => {
        setIsLoading(false);
        toast.error("Failed to log out", {
          position: "top-center",
          autoClose: 2500,
        });
      }, 1000);
      console.error("Logout failed:", error);
    }
  };

  if (location.pathname === "/login" || location.pathname === "/register")
    return null;

  if (location.pathname === "/") return <Header />;

  return (
    <nav className="sticky md:top-0 top-2 w-3/4 md:w-full flex flex-row items-center justify-between z-50 bg-white/95 backdrop-blur-sm shadow-lg md:w-full p-4 mt-4 md:mt-0 rounded-3xl md:rounded-none">
      {/* Logo */}
      <h1
        className="flex items-center gap-2 text-xlfont-bold cursor-pointer"
        onClick={() => navigate("/home")}
      >
        <img
          src="/gold-vip-icon-golden-sign-with-wreath-premium-vector-50461013 (1).ico"
          alt="Logo"
          className="w-8 h-8 rounded-full"
        />
        VIP Travel
      </h1>

      {/* Mobile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="md:hidden p-2 flex flex-col gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="w-6 h-0.5 bg-primary" />
            ))}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="flex flex-col min-w-[180px]"
        >
          {isAuthenticated && location.pathname !== "/" && (
            <DropdownMenuItem
              onClick={() => navigate("/", { replace: true })}
            >
              Home
            </DropdownMenuItem>
          )}
          {isAuthenticated && location.pathname !== "/profile" && (
            <DropdownMenuItem
              onClick={() => navigate("/profile", { replace: true })}
            >
              Profile
            </DropdownMenuItem>
          )}
          {isAuthenticated && location.pathname !== "/my-account" && (
            <DropdownMenuItem
              onClick={() => navigate("/my-account", { replace: true })}
            >
              My Bookings
            </DropdownMenuItem>
          )}
          {isAuthorized && location.pathname !== "/admin-dashboard" && (
            <DropdownMenuItem
              onClick={() => navigate("/admin-dashboard", { replace: true })}
            >
              Admin Dashboard
            </DropdownMenuItem>
          )}
          {isAuthorized && location.pathname !== "/driver-list" && (
            <DropdownMenuItem
              onClick={() => navigate("/driver-list", { replace: true })}
            >
              Driver List
            </DropdownMenuItem>
          )}
          {isAuthenticated && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-4 items-center">
        {isAuthenticated && location.pathname !== "/" && (
          <Button
            variant="ghost"
            onClick={() => navigate("/", { replace: true })}
          >
            Home
          </Button>
        )}
        {isAuthenticated && location.pathname !== "/profile" && (
          <Button
            variant="ghost"
            onClick={() => navigate("/profile", { replace: true })}
          >
            Profile
          </Button>
        )}
        {isAuthenticated && location.pathname !== "/my-account" && (
          <Button
            variant="ghost"
            onClick={() => navigate("/my-account", { replace: true })}
          >
            My Bookings
          </Button>
        )}
        {isAuthorized && location.pathname !== "/admin-dashboard" && (
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard", { replace: true })}
          >
            Admin Dashboard
          </Button>
        )}
        {isAuthorized && location.pathname !== "/driver-list" && (
          <Button
            variant="ghost"
            onClick={() => navigate("/driver-list", { replace: true })}
          >
            Driver List
          </Button>
        )}
        {isAuthenticated && (
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>

      {isLoading && <LoadingScreen />}
    </nav>
  );
}
