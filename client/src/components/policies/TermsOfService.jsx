import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-2">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
        </div>
        <Card className="shadow-xl border border-border rounded-2xl">
          <CardContent className="space-y-8 p-8 leading-relaxed">
            {/* Title */}
            <h1 className="text-4xl font-bold text-center text-foreground mb-8">
              الشروط والأحكام
            </h1>

            {/* Arabic Section */}
            <div dir="rtl" className="space-y-6 text-right">
              <p className="text-lg font-semibold text-foreground">
                • لا يمكنك إلغاء حجز الرحلة إلا قبلها بثلاث ساعات.
              </p>
              <p className="text-lg font-semibold text-foreground">
                • لا يُسمح بالحجز وعدم الحضور إلا بعد إخطار أحد المشرفين مسبقًا.
              </p>
              <p className="text-lg font-semibold text-foreground">
                • يُسمح بتغيير الرحلة (Switch Trip) حتى ساعة واحدة قبل موعد الرحلة.
              </p>
              <p className="text-lg font-semibold text-foreground">
                • لا يُسمح بالتأخر لأكثر من 10 دقائق، وفي حال حدوث ذلك يمكن أن يغادر
                الباص بدون الراكب.
              </p>
              <p className="text-lg font-semibold text-foreground">
                • كل شخص مسؤول عن متعلقاته الشخصية مثل الحقائب أو الأدوات الهندسية
                وغيرها.
              </p>
              <p className="text-lg font-semibold text-foreground">
                • في حالة ضياع أي من المتعلقات بسبب إهمال الراكب، المكتب غير مسؤول عن ذلك.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* English Section */}
            <h1 className="text-4xl font-bold text-center text-foreground mb-8">
             Terms of Service
            </h1>
            <div className="space-y-6 text-left">
              <p className="text-muted-foreground">
                • You can only cancel your trip at least <strong>3 hours before departure</strong>.
              </p>
              <p className="text-muted-foreground">
                • Booking without showing up is not allowed unless you inform an <strong>admin in advance</strong>.
              </p>
              <p className="text-muted-foreground">
                • You may <strong>switch trips</strong> up to one hour before the trip time.
              </p>
              <p className="text-muted-foreground">
                • Delays of more than <strong>10 minutes</strong> are not allowed. The bus may leave without you.
              </p>
              <p className="text-muted-foreground">
                • Each passenger is responsible for their <strong>personal belongings</strong> (bags, tools, etc.).
              </p>
              <p className="text-muted-foreground">
                • The office is <strong>not responsible</strong> for any lost items due to passenger negligence.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TermsOfService;
