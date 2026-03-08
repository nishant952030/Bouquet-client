import process from "node:process";

async function createRazorpayOrder({ amountPaise, currency, receipt, notes }) {
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
      amount: amountPaise,
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

  const { amountPaise, currency = "INR", receipt, notes } = req.body || {};
  if (!amountPaise || Number(amountPaise) < 100) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const order = await createRazorpayOrder({
      amountPaise: Math.round(Number(amountPaise)),
      currency,
      receipt: receipt || `pw_${Date.now()}`,
      notes: notes || {},
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
