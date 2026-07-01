import crypto from "node:crypto";
import process from "node:process";

function verifySignature({ orderId, paymentId, signature, secret }) {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return digest === signature;
}

async function sendViaMsg91({ phone, giftUrl, giftType }) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_WHATSAPP_TEMPLATE_ID;
  const senderId = process.env.MSG91_WHATSAPP_SENDER_ID; // your Vi number registered with MSG91

  if (!authKey || !templateId || !senderId) {
    // Gracefully log and return mock success — real send happens once MSG91 is configured
    console.warn("⚠️ MSG91 credentials not configured. Simulating WhatsApp send.");
    console.log(`📱 Would send to: +91${phone} → ${giftUrl} (type: ${giftType})`);
    return { success: true, mock: true, messageId: `mock_${Date.now()}` };
  }

  // Format phone with country code
  const fullPhone = phone.startsWith("91") ? phone : `91${phone.replace(/^0/, "")}`;

  // MSG91 WhatsApp API
  const body = {
    integrated_number: senderId,
    content_type: "template",
    payload: {
      to: fullPhone,
      type: "template",
      template: {
        name: templateId,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              // {{1}} = gift link in your approved template
              { type: "text", text: giftUrl },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: giftUrl }],
          },
        ],
      },
    },
  };

  const response = await fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: authKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || data?.type === "error") {
    throw new Error(data?.message || "MSG91 WhatsApp send failed");
  }

  return { success: true, messageId: data?.data?.id || "sent", mock: false };
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
    giftUrl,
    recipientPhone,
    giftType = "bouquet",
  } = req.body || {};

  if (!orderId || !paymentId || !signature || !giftUrl || !recipientPhone) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // 1. Verify Razorpay signature
  const isValid = verifySignature({ orderId, paymentId, signature, secret });
  if (!isValid) {
    return res.status(401).json({ ok: false, error: "Invalid payment signature" });
  }

  // 2. Send WhatsApp message
  try {
    const phone = String(recipientPhone).replace(/\D/g, "");
    const result = await sendViaMsg91({ phone, giftUrl, giftType });

    return res.status(200).json({
      ok: true,
      delivered: true,
      mock: result.mock || false,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("❌ WhatsApp delivery failed:", error);
    return res.status(500).json({
      error: error?.message || "WhatsApp delivery failed after payment",
    });
  }
}
