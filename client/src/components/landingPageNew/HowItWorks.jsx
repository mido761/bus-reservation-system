import React from "react";
import { Search, CreditCard, Bus, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Routes",
    description: "Enter your departure and destination cities to find available buses."
  },
  {
    icon: CreditCard,
    title: "Book & Pay",
    description: "Select your preferred time and secure your seat with instant payment."
  },
  {
    icon: Bus,
    title: "Board Bus",
    description: "Show your digital ticket and enjoy a comfortable journey."
  },
  {
    icon: CheckCircle,
    title: "Arrive Safely",
    description: "Reach your destination on time with our reliable service."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Booking your bus ticket is simple and takes just a few minutes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;