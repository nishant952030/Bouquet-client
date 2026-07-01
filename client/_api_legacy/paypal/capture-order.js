import process from "node:process";
import { notifyPayment } from "../_lib/notify.js";

function getBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const payload = await res.json();
  if (!res.ok || !payload?.access_token) {
    throw new Error(payload?.error_description || "Unable to authenticate with PayPal");
  }
  return payload.access_token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ error: "Missing order id" });
  }

  try {
    const token = await getAccessToken();
    const captureRes = await fetch(`${getBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const capture = await captureRes.json();
    if (!captureRes.ok) {
      throw new Error(capture?.message || "Unable to capture PayPal order");
    }

    const captureUnit = capture?.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = captureUnit?.id || "";
    const status = capture?.status || "";
    const ok = status === "COMPLETED";

    // Send email notification (best-effort, non-blocking)
    if (ok) {
      const amountCents = Math.round(
        parseFloat(captureUnit?.amount?.value || "0") * 100
      );
      notifyPayment({
        provider: "PayPal",
        amount: amountCents,
        currency: captureUnit?.amount?.currency_code || "USD",
        paymentId: captureId,
        orderId: capture?.id || orderId,
      }).catch(() => {});
    }

    return res.status(200).json({
      ok,
      status,
      orderId: capture?.id || orderId,
      captureId,
      raw: capture,
    });
  } catch (error) {
    console.error("PayPal capture failed:", error);
    return res.status(500).json({ error: "Unable to capture PayPal order" });
  }
}

