import process from "node:process";
import { db, isConfigured } from "../_lib/firebase-server.js";
import { doc, setDoc } from "firebase/firestore";

const PLATFORM_FEE_INR = 15;

function generateShagunId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No easily confused characters (O, I, 1, 0)
  let result = "SG";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

  const { senderName, receiverName = "", amount, message = "", theme = "wedding" } = req.body || {};
  const giftAmount = Number(amount);

  if (!senderName || !senderName.trim()) {
    return res.status(400).json({ error: "Sender name is required" });
  }

  if (Number.isNaN(giftAmount) || giftAmount < 1) {
    return res.status(400).json({ error: "Invalid gift amount" });
  }

  if (!isConfigured || !db) {
    return res.status(500).json({ error: "Database configuration error. Please check backend setup." });
  }

  const totalAmount = giftAmount + PLATFORM_FEE_INR;
  const amountMinor = totalAmount * 100; // in paise
  const shagunId = generateShagunId();

  try {
    const order = await createRazorpayOrder({
      amountMinor,
      currency: "INR",
      receipt: `shg_${shagunId}_${Date.now()}`,
      notes: {
        shagunId,
        type: "shagun_gift",
        senderName: senderName.trim().slice(0, 40),
        receiverName: receiverName.trim().slice(0, 40),
        giftAmount: String(giftAmount),
        message: message.trim().slice(0, 200),
        theme,
      },
    });

    return res.status(200).json({
      shagunId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      platformFee: PLATFORM_FEE_INR,
    });
  } catch (error) {
    console.error("❌ Failed to create shagun gift order:", error);
    return res.status(500).json({
      error: error?.message || "Unable to initialize shagun gift payment",
    });
  }
}
