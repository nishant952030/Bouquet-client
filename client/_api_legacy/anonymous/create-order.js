import process from "node:process";

const ANONYMOUS_PRICE_INR = 49;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay credentials are missing" });
  }

  const { giftUrl, recipientPhone, giftType = "bouquet" } = req.body || {};

  if (!giftUrl || !recipientPhone) {
    return res.status(400).json({ error: "giftUrl and recipientPhone are required" });
  }

  // Sanitize phone: strip non-digits, ensure 10-12 digit Indian number
  const phone = String(recipientPhone).replace(/\D/g, "");
  if (phone.length < 10 || phone.length > 13) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: ANONYMOUS_PRICE_INR * 100, // paise
        currency: "INR",
        receipt: `anon_${Date.now()}`,
        notes: {
          type: "anonymous_whatsapp_delivery",
          giftUrl,
          recipientPhone: phone,
          giftType,
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error?.description || "Failed to create Razorpay order");
    }

    return res.status(200).json({
      orderId: payload.id,
      amount: payload.amount,
      currency: payload.currency,
    });
  } catch (error) {
    console.error("Anonymous order creation failed:", error);
    return res.status(500).json({ error: error?.message || "Order creation failed" });
  }
}
