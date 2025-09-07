import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign } from "lucide-react";

const routes = [
  {
    from: "E-JUST",
    to: "Cairo",
    duration: "3h 30m",
    price: "120 EGP",
    frequency: "2 times weekly",
  },
  {
    from: "Cairo",
    to: "E-JUST",
    duration: "3h 30m",
    price: "120 EGP",
    frequency: "2 times weekly",
  },
    {
      from: "Chicago",
      to: "Detroit",
      duration: "5h 45m",
      price: "$38",
      frequency: "4 times daily"
    },
    {
      from: "Miami",
      to: "Orlando",
      duration: "3h 20m",
      price: "$32",
      frequency: "Every hour"
    }
];

const PopularRoutes = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Popular Routes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most traveled destinations with frequent departures and
            competitive prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {routes.map((route, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-medium transition-all duration-300 bg-card border-border"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <MapPin className="w-4 h-4 text-primary" />
                    {route.from}
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-foreground font-semibold">
                    {route.to}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {route.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    Starting from {route.price}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    {route.frequency}
                  </p>
                  <Button variant="outline" className="w-full">
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
