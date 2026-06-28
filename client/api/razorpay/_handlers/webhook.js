import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";
import { db, isConfigured } from "../_lib/firebase-server.js";

function getRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);

  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function isValidSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = await getRawBody(req);

  if (!secret) {
    return res.status(500).json({ error: "Server webhook secret is missing" });
  }

  if (!isValidSignature(rawBody, signature, secret)) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  const eventType = event?.event || "unknown";
  const paymentEntity = event?.payload?.payment?.entity;
  const orderEntity = event?.payload?.order?.entity;

  // Keep processing idempotent and lightweight in webhook path.
  console.log("Razorpay webhook verified:", {
    eventType,
    paymentId: paymentEntity?.id,
    orderId: paymentEntity?.order_id || orderEntity?.id,
    amount: paymentEntity?.amount || orderEntity?.amount,
    status: paymentEntity?.status || orderEntity?.status,
  });

  const notes = orderEntity?.notes || paymentEntity?.notes || {};

  if (notes.shagunId && notes.type === "shagun_gift") {
    if (!isConfigured || !db) {
      console.error("❌ Firestore not configured in webhook.");
      return res.status(500).json({ error: "Database configuration error" });
    }

    try {
      const shagunId = notes.shagunId;
      const shagunRef = db.collection("cards").doc(shagunId);
      const docSnap = await shagunRef.get();

      // If document doesn't exist or is not funded yet, write/update it.
      if (!docSnap.exists || docSnap.data().paymentStatus !== "funded") {
        await shagunRef.set({
          id: shagunId,
          senderName: notes.senderName || "Sender",
          receiverName: notes.receiverName || "",
          amount: Number(notes.giftAmount || 0),
          fee: 15,
          message: notes.message || "Best wishes!",
          theme: notes.theme || "wedding",
          paymentStatus: "funded",
          status: "unclaimed",
          razorpayOrderId: orderEntity?.id || paymentEntity?.order_id || "",
          razorpayPaymentId: paymentEntity?.id || "",
          createdAt: docSnap.exists ? docSnap.data().createdAt : new Date().toISOString(),
          fundedAt: new Date().toISOString(),
        }, { merge: true });
        console.log(`🔥 Webhook marked shagun envelope ${shagunId} as funded.`);
      }
    } catch (dbErr) {
      console.error("❌ Failed to update Firestore from webhook:", dbErr);
      return res.status(500).json({ error: "Failed to persist payout record" });
    }
  }

  return res.status(200).json({ ok: true });
}
