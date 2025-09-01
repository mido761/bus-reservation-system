import nodemailer from "nodemailer";

export async function sendTicketEmail(to, ticket) {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // or "smtp.ethereal.email" for testing
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Email HTML template
  const html = `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color:#2c3e50; text-align:center;">🎟 Your Bus Ticket</h2>
      <p style="text-align:center; color:#555;">Thank you for booking with <b>Busify</b>. Below are your ticket details:</p>

      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Ticket ID</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${ticket.ticket_id}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Passenger Name</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${ticket.username}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Route</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${ticket.source} → ${ticket.destination}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Date</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${ticket.date}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Departure Time</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${ticket.departure_time}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Seat</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${ticket.seat_number}</td>
        </tr>
      </table>

      <p style="color:#27ae60; font-size:16px; text-align:center;">
        ✅ Payment confirmed & your seat is reserved.
      </p>

      <p style="text-align:center; margin-top:20px;">
        <a href="${ticket.qr_link}" style="background:#3498db; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px;">Download Ticket</a>
      </p>

      <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
      <p style="font-size:12px; text-align:center; color:#aaa;">
        If you have any questions, contact us at support@busify.com
      </p>
    </div>
  </div>
  `;

  // 3. Send mail
  await transporter.sendMail({
    from: `"Busify Tickets" <${process.env.MAIL_USER}>`,
    to,
    subject: "Your Bus Ticket 🎟",
    html,
  });
}
