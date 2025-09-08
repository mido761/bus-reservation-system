import React from "react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-indigo-50 to-white rounded-xl p-8 shadow-md text-center max-w-3xl mx-auto mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to Your Account
      </h2>
      <p className="text-gray-600 text-lg leading-relaxed">
        Here you can view your past trips, manage your bookings, and check your payment history.
        <br />
        Click the menu to get started!
      </p>
    </section>
  );
}
