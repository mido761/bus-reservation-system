import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "New York",
    rating: 5,
    comment: "Excellent service! The bus was clean, comfortable, and arrived exactly on time. The booking process was so easy."
  },
  {
    name: "Mike Chen",
    location: "Los Angeles", 
    rating: 5,
    comment: "I travel frequently for work and this is by far the best bus service I've used. Professional drivers and great customer support."
  },
  {
    name: "Emma Williams",
    location: "Chicago",
    rating: 5,
    comment: "Affordable prices without compromising on quality. The seats were comfortable and the Wi-Fi worked perfectly throughout the journey."
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied travelers who trust us for their journeys.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 bg-card border-border hover:shadow-medium transition-all duration-300">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;