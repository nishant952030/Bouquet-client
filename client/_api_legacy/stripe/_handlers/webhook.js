import crypto from "node:crypto";
import process from "node:process";
import { Buffer } from "node:buffer";

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

function parseStripeSignature(header) {
  const parts = String(header || "").split(",");
  const parsed = {};
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) parsed[key.trim()] = value.trim();
  }
  return parsed;
}

function isValidStripeSignature({ rawBody, signatureHeader, webhookSecret }) {
  if (!signatureHeader || !webhookSecret) return false;
  const parsed = parseStripeSignature(signatureHeader);
  const timestamp = parsed.t;
  const signature = parsed.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", webhookSecret).update(signedPayload).digest("hex");
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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: "Stripe webhook secret missing" });
  }

  const rawBody = await getRawBody(req);
  const signatureHeader = req.headers["stripe-signature"];
  const isValid = isValidStripeSignature({ rawBody, signatureHeader, webhookSecret });

  if (!isValid) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  if (event?.type === "checkout.session.completed") {
    const session = event?.data?.object || {};
    console.log("Stripe checkout completed:", {
      sessionId: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      planId: session.metadata?.plan_id,
      bouquetId: session.metadata?.bouquet_id,
    });
  }

  return res.status(200).json({ ok: true });
}
