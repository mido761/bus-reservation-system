import React from "react";
import { Card } from "@/components/ui/card";
import { Shield, Clock, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Travel with confidence knowing your journey is protected with our safety measures and insurance coverage."
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "We pride ourselves on punctuality with over 95% of our buses arriving exactly on schedule."
  },
  {
    icon: CreditCard,
    title: "Easy Booking",
    description: "Book your tickets in seconds with our streamlined process and secure payment options."
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our customer service team is available around the clock to assist with any questions or concerns."
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Us?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our commitment to comfort, reliability, and exceptional service.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-8 text-center hover:shadow-medium transition-all duration-300 bg-card border-border">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;