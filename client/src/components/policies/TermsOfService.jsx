import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg border-border">
          <CardContent className="space-y-6 p-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>

            <p className="text-muted-foreground">
              Welcome to our platform. By accessing or using our services,
              you agree to comply with these Terms of Service. Please read
              them carefully.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By registering an account or using our services, you agree to
              these terms and all applicable laws and regulations.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">
              2. User Responsibilities
            </h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your
              account and ensuring your activities comply with the law.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">
              3. Service Limitations
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any part
              of our services at any time, without prior notice.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TermsOfService;
