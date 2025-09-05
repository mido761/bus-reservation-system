import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CardForm({ title, children, onSubmit }) {
  return (
    <Card className="w-full max-w-xs mx-auto p-2">
      <CardHeader>
        <CardTitle className="text-center text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-2" onSubmit={onSubmit}>
          {children}
        </form>
      </CardContent>
    </Card>
  );
}
