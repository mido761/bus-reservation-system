import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import PopularRoutes from "./PopularRoutes";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <Features />
        <PopularRoutes />
        <HowItWorks />
        <Testimonials />
      </main>
    </div>
  );
};

export default Index;

