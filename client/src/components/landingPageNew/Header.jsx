import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bus, Menu } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="#routes"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Routes
            </a>
            <a
              href="#about"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
            <Button onClick={() => navigate("/home")}>Book Now</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
