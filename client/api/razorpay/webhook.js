import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";

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

  // Keep processing idempotent and lightweight in webhook path.
  // Add persistence/business logic here (DB update, notification, etc.).
  console.log("Razorpay webhook verified:", {
    eventType,
    paymentId: paymentEntity?.id,
    orderId: paymentEntity?.order_id,
    amount: paymentEntity?.amount,
    status: paymentEntity?.status,
  });

  return res.status(200).json({ ok: true });
}
