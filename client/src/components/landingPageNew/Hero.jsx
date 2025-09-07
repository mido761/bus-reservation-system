import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, Users } from "lucide-react";
// import heroImage from "@/assets/hero-bus.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      {/* <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(33, 150, 243, 0.8), rgba(25, 118, 210, 0.9)), url(${heroImage})`,
        }}
      /> */}
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 mt-6 leading-tight">
            Travel Made <span className="text-primary-light">Simple</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary/90 mb-12 leading-relaxed">
            Book your bus tickets instantly with comfortable rides and reliable service
          </p>
          
          {/* Booking Form */}
          <Card className="bg-white/95 backdrop-blur-sm p-8 shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  From
                </label>
                <Input placeholder="Enter departure city" className="h-12" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  To
                </label>
                <Input placeholder="Enter destination" className="h-12" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Date
                </label>
                <Input type="date" className="h-12" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Passengers
                </label>
                <select className="w-full h-12 px-3 py-2 bg-background border border-input rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4+ Passengers</option>
                </select>
              </div>
            </div>
            
            <Button variant="default" className="w-full mt-8 h-14 text-lg font-semibold shadow-soft">
              Search Buses
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;