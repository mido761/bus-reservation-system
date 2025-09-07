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
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
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
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }, 1000);
      console.error("Logout failed:", error);
    }
  };

  if (location.pathname === "/login" || location.pathname === "/register")
    return null;

  return (
    <nav className="sticky md:top-0 top-2 flex justify-between items-center h-[50px] w-[90%] md:w-full p-4 mt-4 md:mt-0 rounded-3xl md:rounded-none text-white bg-primary shadow-lg">
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

      {/* Hamburger / Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="md:hidden hover:bg-transparent">
            <span className="group hamburger-icon flex flex-col gap-1">
              <span className="w-6 h-0.5 bg-white group-hover:bg-black"></span>
              <span className="w-6 h-0.5 bg-white group-hover:bg-black"></span>
              <span className="w-6 h-0.5 bg-white group-hover:bg-black"></span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex flex-col min-w-[180px]"
        >
          {isAuthenticated && !(location.pathname === "/profile") && (
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
          {isAuthenticated && (
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop links */}
      <div className="hidden md:flex gap-4 items-center">
        {isAuthenticated && !(location.pathname === "/profile") && (
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

        {isAuthenticated && (
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>

  {isLoading && <LoadingScreen />}
  <ToastContainer position="top-center" autoClose={2500} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </nav>
  );
}
