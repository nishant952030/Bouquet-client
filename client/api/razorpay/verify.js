import crypto from "node:crypto";
import process from "node:process";
import { notifyPayment } from "../_lib/notify.js";

function verifySignature({ orderId, paymentId, signature, secret }) {
  const digest = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return digest === signature;
}

export default async function handler(req, res) {
  console.log("🔔 Razorpay verify endpoint hit");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server verification secret is missing" });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body || {};

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: "Missing payment verification fields" });
  }

  const isValid = verifySignature({ orderId, paymentId, signature, secret });
  if (!isValid) {
    return res.status(401).json({ ok: false, error: "Invalid payment signature" });
  }

  // Send email notification — must await before responding,
  // otherwise Vercel kills the function before it completes.
  try {
    await notifyPayment({
      provider: "Razorpay",
      amount: 0,
      currency: "INR",
      paymentId,
      orderId,
    });
  } catch (err) {
    console.error("❌ Email notify error:", err);
  }

  return res.status(200).json({ ok: true });
}

