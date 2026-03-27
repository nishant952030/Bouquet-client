import process from "node:process";
import { getSmallPlanPrice, getUnlimitedPlanPrice } from "../../src/lib/pricing.js";

async function createRazorpayOrder({ amountMinor, currency, receipt, notes }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay server credentials are missing");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency,
      receipt,
      notes,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.description || "Failed to create Razorpay order");
  }

  return payload;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amountPaise, planId = "small", receipt, notes } = req.body || {};
  const serverAmountPaise =
    String(planId) === "medium" ? getUnlimitedPlanPrice() * 100 : getSmallPlanPrice() * 100;
  const requestedAmount = Number(amountPaise);
  const finalAmountPaise =
    Number.isFinite(requestedAmount) && requestedAmount > 0 ? Math.round(requestedAmount) : serverAmountPaise;

  if (!finalAmountPaise || finalAmountPaise < 1) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const order = await createRazorpayOrder({
      amountMinor: finalAmountPaise,
      currency: "INR",
      receipt: receipt || `pw_${Date.now()}`,
      notes: { ...(notes || {}), planId: String(planId || "small") },
    });
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return res.status(500).json({ error: "Unable to create payment order" });
  }
}
