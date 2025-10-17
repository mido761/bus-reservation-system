import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Bus, Globe } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-2">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
        </div>

        {/* ===== Arabic Section ===== */}
        <div className="text-center max-w-3xl mx-auto mb-16" dir="rtl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            إحنا مين؟
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            إحنا شركة نقل هدفها تسهل السفر بين المدن والجامعات بطريقة مريحة وآمنة وسهلة.
            بنستخدم التكنولوجيا عشان نخلي تجربة الحجز والسفر أبسط وأسرع وأكتر راحة ليك.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20" dir="rtl">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Users className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                الراكب أولاً
              </h3>
              <p className="text-muted-foreground text-sm">
                راحتك وسلامتك أهم أولوياتنا، وكل خدماتنا معمولة عشان تضمن تجربة سفر سهلة وممتعة.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Bus className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                أوتوبيسات حديثة
              </h3>
              <p className="text-muted-foreground text-sm">
                عندنا أسطول من الأوتوبيسات الحديثة والمجهزة بأعلى معايير الأمان
                عشان الرحلة تكون مريحة وآمنة وفي وقتها.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Globe className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                بنكبر كل يوم
              </h3>
              <p className="text-muted-foreground text-sm">
                رؤيتنا إننا نغطي أكتر عدد ممكن من الخطوط 
                ونوصل خدماتنا لكل المدن والجامعات.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center max-w-2xl mx-auto" dir="rtl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            بنمشي معاك خطوة بخطوة
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            كل رحلة معانا مش مجرد وسيلة نقل، 
            دي تجربة مليانة راحة وأمان وثقة في كل مشوار.
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
            We are a transportation company dedicated to making travel between
            cities and universities safer, easier, and more comfortable.
            By using technology, we aim to make booking and traveling simpler,
            faster, and more convenient for everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Users className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Passenger First
              </h3>
              <p className="text-muted-foreground text-sm">
                Your comfort and safety are our top priorities.
                Every service we offer is designed to give you a better travel experience.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Bus className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Modern Fleet
              </h3>
              <p className="text-muted-foreground text-sm">
                We operate a fleet of modern, well-maintained buses to ensure
                your journey is safe, on time, and comfortable.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center space-y-4">
              <Globe className="w-10 h-10 mx-auto text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Growing Network
              </h3>
              <p className="text-muted-foreground text-sm">
                Our vision is to expand our routes and connect more
                cities, universities, and communities every day.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Together on Every Journey
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Every trip with us is more than just transportation — it’s
            comfort, trust, and a better travel experience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
