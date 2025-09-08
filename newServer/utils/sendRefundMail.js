import nodemailer from "nodemailer";

export async function sendRefundEmail(to, { bookingId, refundId, transactionId, amount }) {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  
  // 2. Email HTML template
  const html = `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color:#e74c3c; text-align:center;">💸 Refund Processed</h2>
      <p style="text-align:center; color:#555;">
        Your refund for booking <b>#${bookingId}</b> has been processed successfully.
      </p>

      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Refund ID</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${refundId}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Transaction ID</b></td>
          <td style="padding:10px; border:1px solid #ddd;">${transactionId}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><b>Amount Refunded</b></td>
          <td style="padding:10px; border:1px solid #ddd;">$${amount}</td>
        </tr>
      </table>

      <p style="color:#27ae60; font-size:16px; text-align:center;">
        ✅ The amount has been returned to your original payment method.
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
    from: `"Busify Refunds" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Refund Has Been Processed 💸",
    html,
  });
}
