import { Resend } from "resend";
import process from "node:process";

const NOTIFY_EMAIL = "support@petalsandwords.com";

/**
 * Send a payment notification email.
 * Best-effort — never throws, just logs on failure.
 */
export async function notifyPayment({ provider, amount, currency, paymentId, orderId }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email notification.");
    return;
  }

  const resend = new Resend(apiKey);
  const amountStr = currency === "INR"
    ? `₹${amount}`
    : `$${(amount / 100).toFixed(2)}`;

  try {
    await resend.emails.send({
      from: "Petals & Words <notifications@petalsandwords.com>",
      to: [NOTIFY_EMAIL],
      subject: `☕ New tip received — ${amountStr} via ${provider}!`,
      html: `
        <div style="font-family:'Manrope',Arial,sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#faf9f6;border-radius:16px;">
          <div style="text-align:center;margin-bottom:1.5rem;">
            <span style="font-size:2.5rem;">☕</span>
            <h1 style="font-family:'Georgia',serif;font-size:1.5rem;color:#3E2723;margin:0.5rem 0 0;">
              New tip received!
            </h1>
          </div>
          <div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <table style="width:100%;border-collapse:collapse;font-size:0.95rem;color:#3E2723;">
              <tr>
                <td style="padding:8px 0;color:#7b5455;font-weight:600;">Amount</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;font-size:1.1rem;">${amountStr}</td>
              </tr>
              <tr style="border-top:1px solid #f0ebe5;">
                <td style="padding:8px 0;color:#7b5455;font-weight:600;">Provider</td>
                <td style="padding:8px 0;text-align:right;">${provider}</td>
              </tr>
              <tr style="border-top:1px solid #f0ebe5;">
                <td style="padding:8px 0;color:#7b5455;font-weight:600;">Payment ID</td>
                <td style="padding:8px 0;text-align:right;font-size:0.85rem;color:#6b5e5f;">${paymentId || "—"}</td>
              </tr>
              <tr style="border-top:1px solid #f0ebe5;">
                <td style="padding:8px 0;color:#7b5455;font-weight:600;">Order ID</td>
                <td style="padding:8px 0;text-align:right;font-size:0.85rem;color:#6b5e5f;">${orderId || "—"}</td>
              </tr>
              <tr style="border-top:1px solid #f0ebe5;">
                <td style="padding:8px 0;color:#7b5455;font-weight:600;">Time</td>
                <td style="padding:8px 0;text-align:right;font-size:0.85rem;color:#6b5e5f;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
            </table>
          </div>
          <p style="text-align:center;font-size:0.8rem;color:#9e8f90;margin-top:1.5rem;">
            petals & words 🌸
          </p>
        </div>
      `,
    });
    console.log(`✅ Payment notification sent to ${NOTIFY_EMAIL}`);
  } catch (err) {
    console.error("Email notification failed (non-fatal):", err.message);
  }
}
