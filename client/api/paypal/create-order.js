import process from "node:process";

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

  const { amountCents, currency = "USD", planId = "small", senderName = "Someone special" } = req.body || {};
  const cents = Math.round(Number(amountCents || 0));
  if (!cents || cents < 1) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const token = await getAccessToken();
    const value = (cents / 100).toFixed(2);

    const createRes = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: String(currency).toUpperCase(),
              value,
            },
            description: `Petals and Words - ${planId === "small" ? "Small" : "Unlimited"} plan`,
            custom_id: `pw_${Date.now()}`,
          },
        ],
        payer: {
          name: {
            given_name: String(senderName || "Someone"),
          },
        },
      }),
    });

    const order = await createRes.json();
    if (!createRes.ok || !order?.id) {
      throw new Error(order?.message || "Unable to create PayPal order");
    }

    return res.status(200).json({
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error("PayPal create order failed:", error);
    return res.status(500).json({ error: "Unable to create PayPal order" });
  }
}
