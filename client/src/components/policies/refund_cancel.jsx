import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const RefundCancel = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center text-foreground">
          Refund & Cancellation Policy
        </h1>

        {/* Policy Card */}
        <Card className="shadow-md">
          <CardContent className="p-8 space-y-8">
            {/* Refund Policy */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                Refund Policy
              </h2>
              <Separator />
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  Cancellations made{" "}
                  <span className="font-semibold">at least 24 hours before</span>{" "}
                  the trip are eligible for a full refund.
                </li>
                <li>
                  Refunds will be processed within{" "}
                  <span className="font-semibold">5–7 business days</span>.
                </li>
              </ul>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                Cancellation Policy
              </h2>
              <Separator />
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  No refunds will be issued for cancellations made{" "}
                  <span className="font-semibold">less than 24 hours</span> prior
                  to departure.
                </li>
                <li>
                  In the event of a service disruption from our side, customers
                  will receive a{" "}
                  <span className="font-semibold">full refund</span> or the
                  option to reschedule at no additional cost.
                </li>
              </ul>

              {/* Professional CTA */}
              <p className="pt-4 text-muted-foreground">
                To manage or cancel your reservation, please visit{" "}
                <Link
                  to="/my-account"
                  className="text-primary font-semibold hover:underline"
                >
                  My Account
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RefundCancel;
