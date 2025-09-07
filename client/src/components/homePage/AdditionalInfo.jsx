import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Users } from "lucide-react";


const AdditionalInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-4">
      <Card className="p-6 text-center">
        <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Flexible Booking</h3>
        <p className="text-sm text-muted-foreground">
          Change your travel dates up to 24 hours before departure
        </p>
      </Card>

      <Card className="p-6 text-center">
        <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
        <h3 className="font-semibold mb-2">100+ Destinations</h3>
        <p className="text-sm text-muted-foreground">
          Travel to major cities across the country
        </p>
      </Card>

      <Card className="p-6 text-center">
        <Users className="w-8 h-8 text-primary mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Group Discounts</h3>
        <p className="text-sm text-muted-foreground">
          Save more when booking for 4 or more passengers
        </p>
      </Card>
    </div>
  );
};

export default AdditionalInfo;