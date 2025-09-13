import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Bus, Globe } from "lucide-react";

const About = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ===== Arabic Section ===== */}
        <div className="text-center max-w-3xl mx-auto mb-16" dir="rtl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            إحنا مين؟
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            إحنا شغالين على إننا نغير فكرة السفر بالأوتوبيس، 
            نخليه أريح وأأمن وأسهل. هدفنا نوصّل الناس ببعض 
            ونخلي التنقل بين المدن والجامعات أهون وأرخص 
            باستخدام التكنولوجيا.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20" dir="rtl">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Users className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                الراكب رقم واحد
              </h3>
              <p className="text-muted-foreground text-sm">
                كل خدماتنا معمولة عشان تركب مرتاح ومطمن 
                وتكون مبسوط طول الرحلة.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Bus className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                أسطول مضمون
              </h3>
              <p className="text-muted-foreground text-sm">
                عندنا أوتوبيسات جديدة ومجهزة كويس، 
                عشان الرحلة تبقى في معادها وآمنة 
                وصديقة للبيئة.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Globe className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                بنوسع المشوار
              </h3>
              <p className="text-muted-foreground text-sm">
                رؤيتنا إننا نزود خطوطنا أكتر وأكتر 
                عشان التنقل يبقى أسهل بين المدن والجامعات والمناطق.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center max-w-2xl mx-auto" dir="rtl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            مكملين سوا
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            كل مشوار معانا مش بس نقلك من مكان لمكان، 
            إحنا بنوصّل ثقة وأمان وتجربة سفر أحسن.
          </p>
        </div>

        {/* ===== Divider ===== */}
        <div className="my-16 flex items-center">
          <div className="flex-grow border-t border-muted"></div>
          <span className="px-4 text-muted-foreground text-sm uppercase">
            English
          </span>
          <div className="flex-grow border-t border-muted"></div>
        </div>

        {/* ===== English Section ===== */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are committed to redefining bus travel with comfort, safety,
            and reliability. Our mission is to connect people and places
            through seamless, affordable, and technology-driven transportation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Users className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Customer First
              </h3>
              <p className="text-muted-foreground text-sm">
                Our services are designed around the needs of our passengers,
                ensuring comfort and satisfaction in every journey.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Bus className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Reliable Fleet
              </h3>
              <p className="text-muted-foreground text-sm">
                We maintain a modern and well-equipped fleet, ensuring safe,
                on-time, and eco-friendly travel across all routes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Globe className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Expanding Horizons
              </h3>
              <p className="text-muted-foreground text-sm">
                Our vision is to expand connectivity, making travel easier
                between cities, campuses, and communities.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Moving Forward Together
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            With every trip, we aim to deliver more than just a ride —
            we deliver trust, safety, and a better travel experience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
