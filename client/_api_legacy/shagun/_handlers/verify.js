import crypto from "node:crypto";
import process from "node:process";
import { db, isConfigured } from "../../_lib/firebase-server.js";

const PLATFORM_FEE_INR = 15;

function verifySignature({ orderId, paymentId, signature, secret }) {
  const digest = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return digest === signature;
}

async function getRazorpayOrder(orderId) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.description || "Failed to fetch Razorpay order details");
  }

  return payload;
}

export default async function handler(req, res) {
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
    shagunId,
  } = req.body || {};

  if (!orderId || !paymentId || !signature || !shagunId) {
    return res.status(400).json({ error: "Missing verification parameters" });
  }

  if (!isConfigured || !db) {
    return res.status(500).json({ error: "Database configuration error" });
  }

  try {
    // 1. Verify Razorpay signature
    const isValid = verifySignature({ orderId, paymentId, signature, secret });
    if (!isValid) {
      return res.status(401).json({ ok: false, error: "Invalid payment signature" });
    }

    // 2. Fetch order notes from Razorpay
    const order = await getRazorpayOrder(orderId);
    const notes = order.notes || {};

    if (notes.shagunId !== shagunId) {
      return res.status(400).json({ error: "Shagun ID mismatch" });
    }

    // 3. Create the shagun record in Firestore using Admin SDK
    const shagunRef = db.collection("cards").doc(shagunId);
    const payload = {
      id: shagunId,
      senderName: notes.senderName || "Sender",
      receiverName: notes.receiverName || "",
      amount: Number(notes.giftAmount || 0),
      fee: PLATFORM_FEE_INR,
      message: notes.message || "Best wishes!",
      theme: notes.theme || "wedding",
      paymentStatus: "funded",
      status: "unclaimed",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      createdAt: new Date(order.created_at * 1000).toISOString(),
      paidAt: new Date().toISOString(),
      fundedAt: new Date().toISOString(),
    };

    await shagunRef.set(payload);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Failed to verify payment for shagun:", error);
    return res.status(500).json({
      error: error?.message || "Verification processing failed",
    });
  }
}
