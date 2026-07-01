import process from "node:process";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionId = req.query?.session_id;

  if (!secretKey) {
    return res.status(500).json({ error: "Stripe secret key missing" });
  }

  if (!sessionId) {
    return res.status(400).json({ error: "Missing session id" });
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Unable to verify Stripe session");
    }

    return res.status(200).json({
      ok: payload.payment_status === "paid",
      paymentStatus: payload.payment_status,
      amountTotal: payload.amount_total,
      currency: payload.currency,
      metadata: payload.metadata || {},
    });
  } catch (error) {
    console.error("Stripe session verify failed:", error);
    return res.status(500).json({ error: "Unable to verify checkout session" });
  }
}
