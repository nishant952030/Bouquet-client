import process from "node:process";

function toFormBody(values) {
  return new URLSearchParams(values).toString();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Stripe secret key missing" });
  }

  const {
    amountUsdCents,
    planId,
    bouquetId = "",
    senderName = "Someone special",
    successUrl,
    cancelUrl,
  } = req.body || {};

  if (!amountUsdCents || Number(amountUsdCents) < 50) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  if (!successUrl || !cancelUrl) {
    return res.status(400).json({ error: "Missing redirect URLs" });
  }

  try {
    const body = toFormBody({
      mode: "payment",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(Math.round(Number(amountUsdCents))),
      "line_items[0][price_data][product_data][name]": `Petals and Words - ${planId === "small" ? "Small" : "Unlimited"} plan`,
      "line_items[0][quantity]": "1",
      "metadata[plan_id]": String(planId || "medium"),
      "metadata[bouquet_id]": String(bouquetId),
      "metadata[sender_name]": String(senderName),
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Unable to create Stripe checkout session");
    }

    return res.status(200).json({
      id: payload.id,
      url: payload.url,
    });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return res.status(500).json({ error: "Unable to start global checkout" });
  }
}
