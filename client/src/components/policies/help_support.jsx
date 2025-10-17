import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const HelpSupport = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl space-y-10">
        <div className="mb-2">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-center text-foreground mb-8">
          Support
        </h1>
        {/* FAQ Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>• How do I book a bus ticket?</li>
                <li>• Can I cancel or reschedule a booking?</li>
                <li>• How do I switch trips?</li>
                <li>• What if my booking issued?</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Contact Us</h2>
              {/* <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                support.VipTravel@gmail.com
              </div> */}
              {/* <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                Phone Number             
                 </div> */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <a
                  href="https://whatsapp.com/channel/0029VbBLp5kJENxs4OUjVD2p"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp Support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links */}
        <div className="text-center space-x-4">
          <Link to="/terms" className="font-bold text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className=" font-bold text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HelpSupport;
