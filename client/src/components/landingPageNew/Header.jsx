import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="hover:text-primary font-medium">
              Home
            </a>
            <a href="#routes" className="hover:text-primary font-medium">
              Routes
            </a>
            <a href="#about" className="hover:text-primary font-medium">
              About
            </a>
            <a href="#contact" className="hover:text-primary font-medium">
              Contact
            </a>
          </nav>


          {/* CTA Button */}
          <div className="flex flex-row items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/home")}>
              Book Now
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Dropdown for links */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => navigate("/home")}>
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/routes")}>
                  Routes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/about")}>
                  About
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/contact")}>
                  Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
