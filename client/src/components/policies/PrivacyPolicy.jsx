import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg border-border">
          <CardContent className="space-y-6 p-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>

            <p className="text-muted-foreground">
              Your privacy is important to us. This Privacy Policy explains
              how we collect, use, and protect your personal data when you
              use our platform.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground">
              We may collect information such as your name, email, phone
              number, and payment details when you use our services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">
              2. How We Use Information
            </h2>
            <p className="text-muted-foreground">
              Your data is used to provide services, process bookings,
              enhance user experience, and communicate with you.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">
              3. Data Protection
            </h2>
            <p className="text-muted-foreground">
              We use industry-standard security measures to safeguard your
              data. However, no method of transmission is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-6">
              4. Your Rights
            </h2>
            <p className="text-muted-foreground">
              You may request access, correction, or deletion of your
              personal information at any time by contacting us.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
