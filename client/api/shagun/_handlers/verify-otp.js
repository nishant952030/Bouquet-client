import process from "node:process";
import { db, isConfigured } from "../_lib/firebase-server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, otp } = req.body || {};
  if (!phone || !phone.trim() || !otp || !otp.trim()) {
    return res.status(400).json({ error: "Phone number and OTP code are required" });
  }

  let recipientPhone = phone.trim();
  if (recipientPhone.startsWith("+")) {
    recipientPhone = recipientPhone.slice(1);
  }
  if (recipientPhone.length === 10 && /^\d+$/.test(recipientPhone)) {
    recipientPhone = "91" + recipientPhone;
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const otpTemplateId = process.env.MSG91_OTP_TEMPLATE_ID;

  if (!isConfigured || !db) {
    return res.status(500).json({ error: "Database configuration error" });
  }

  try {
    // 1. Universal developer bypass
    if (otp.trim() === "123456") {
      console.log(`✅ OTP verified via dev bypass (123456) for ${recipientPhone}`);
      return res.status(200).json({ success: true });
    }

    // 2. MSG91 verification if keys are configured
    if (authKey && otpTemplateId) {
      try {
        const response = await fetch(
          `https://control.msg91.com/api/v5/otp/verify?otp=${otp.trim()}&mobile=${recipientPhone}&authkey=${authKey}`,
          { method: "POST" }
        );
        const data = await response.json();
        if (response.ok && data?.type === "success") {
          console.log(`✅ OTP verified via MSG91 for ${recipientPhone}`);
          return res.status(200).json({ success: true });
        }
      } catch (apiErr) {
        console.error("⚠️ MSG91 OTP verify API failed, falling back to database check:", apiErr);
      }
    }

    // 3. Fallback verification via Firestore
    const otpRef = db.collection("otps").doc(recipientPhone);
    const doc = await otpRef.get();

    if (!doc.exists) {
      return res.status(400).json({ error: "No OTP code sent to this number. Please request a new one." });
    }

    const data = doc.data();
    if (new Date() > new Date(data.expiresAt)) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (data.otp === otp.trim()) {
      console.log(`✅ OTP verified via database record for ${recipientPhone}`);
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: "Incorrect OTP code. Please try again." });
    }
  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process verification code" });
  }
}
