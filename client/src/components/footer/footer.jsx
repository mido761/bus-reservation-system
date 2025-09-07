import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bus, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
   
  if (location.pathname === "/login" || location.pathname === "/register") return null;
  return (
    <footer className="bg-primary text-white w-full">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bus className="w-8 h-8" />
              <span className="text-2xl font-bold">Vip Travel</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              Your trusted partner for comfortable and reliable bus travel across the country. 
              Book with confidence and travel with comfort.
            </p>
            <div className="flex gap-4">
              <Facebook className="w-6 h-6 text-white/60 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-6 h-6 text-white/60 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-6 h-6 text-white/60 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Book Tickets</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Track Bus</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Cancel/Refund</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Help & Support</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Bus Hire</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Group Booking</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Corporate Travel</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Travel Insurance</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/80">
                <Phone className="w-4 h-4" />
                <span>1-800-BUS-RIDE</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Mail className="w-4 h-4" />
                <span>support@busgo.com</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>123 Transit Ave, City</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-white/80">Get travel updates & deals</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button variant="secondary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © 2024 BusGo. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;