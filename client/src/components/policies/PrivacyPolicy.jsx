import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
              سياسة الخصوصية 
            </h1>

            {/* Arabic Section */}
            <div dir="rtl" className="space-y-6 text-right">
              <p className="text-lg text-foreground font-semibold">
                خصوصيتك تهمنا. توضح هذه السياسة كيف نقوم بجمع واستخدام وحماية بياناتك الشخصية عند استخدامك لمنصتنا.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                ١. المعلومات التي نجمعها
              </h2>
              <p className="text-lg text-foreground">
                نقوم بجمع المعلومات الأساسية عند التسجيل مثل: اسم المستخدم، البريد الإلكتروني، كلمة المرور، الجنس، ورقم الهاتف.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                ٢. كيفية استخدام المعلومات
              </h2>
              <p className="text-lg text-foreground">
                نستخدم هذه المعلومات لتوفير الخدمات، وإدارة الحجوزات، وتحسين تجربة المستخدم، والتواصل معك عند الحاجة.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                ٣. حماية البيانات
              </h2>
              <p className="text-lg text-foreground">
                نستخدم إجراءات أمان قياسية لحماية بياناتك من الوصول غير المصرح به. ومع ذلك، لا توجد وسيلة نقل بيانات آمنة بنسبة ١٠٠٪.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                ٤. حقوقك
              </h2>
              <p className="text-lg text-foreground">
                يمكنك طلب الوصول إلى معلوماتك الشخصية أو تعديلها أو حذفها في أي وقت من خلال التواصل معنا.
              </p>
            </div>

            <hr className="my-6 border-border" />

            {/* English Section */}
            <h1 className="text-4xl font-bold text-center text-foreground mb-8">
               Privacy Policy
            </h1>
            <div className="space-y-6 text-left">
              <p className="text-muted-foreground">
                Your privacy matters to us. This Privacy Policy explains how we collect, use, and protect your personal information when using our platform.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground">
                We collect basic information such as your <strong>username, email, password, gender,</strong> and <strong>phone number</strong> when you register or use our services.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                2. How We Use Information
              </h2>
              <p className="text-muted-foreground">
                We use your data to provide our services, manage bookings, improve your experience, and communicate with you when needed.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                3. Data Protection
              </h2>
              <p className="text-muted-foreground">
                We apply standard security measures to protect your data from unauthorized access. However, no data transmission method is completely secure.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-6">
                4. Your Rights
              </h2>
              <p className="text-muted-foreground">
                You have the right to request access, correction, or deletion of your personal information at any time by contacting us.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
