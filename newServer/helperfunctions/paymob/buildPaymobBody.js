import formatDateAndTime from '../../../client/src/formatDateAndTime.js'

// 🔹 Helper 2: Build Paymob request body
export function buildPaymobBody(payment, user, booking, trip, route) {
  return {
    amount: trip.price * 100,
    currency: "EGP",
    payment_methods: [Number(process.env.INTEGRATION_ID)],

    items: [
      {
        name: `Trip ${route.source} → ${route.destination}`,
        amount: trip.price * 100, 
        description: `Pickup: ${booking.stop_name}, Date: ${formatDateAndTime(trip.date, 'date')}, Takeoff: ${formatDateAndTime(trip.departure_time)}`,
        quantity: 1,
      },
    ],

    billing_data: {
      first_name: user.username,
      last_name: user.last_name || "unknown",
      phone_number: user.phone_number,
      city: "dummy",
      country: "dummy",
      email: user.email,
      floor: "dummy",
      state: "dummy",
    },

    extras: { ee: 22 },
    special_reference: `${payment.payment_id}`,
    notification_url: `${process.env.BASE_URL}/payment/webhook`,
    redirection_url: "http://localhost:5173/#/payment-status",
  };
}
