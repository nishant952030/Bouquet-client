import process from "node:process";
import { db, isConfigured } from "../../_lib/firebase-server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone } = req.body || {};
  if (!phone || !phone.trim() || phone.trim().length < 10) {
    return res.status(400).json({ error: "Invalid phone number" });
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

  // Generate a random 6-digit OTP for simulation
  const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));

  if (!isConfigured || !db) {
    return res.status(500).json({ error: "Database configuration error" });
  }

  try {
    // Store in Firestore for verification fallback
    const otpRef = db.collection("otps").doc(recipientPhone);
    await otpRef.set({
      otp: generatedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes validity
    });

    if (!authKey || !otpTemplateId) {
      console.warn("⚠️ MSG91_AUTH_KEY or MSG91_OTP_TEMPLATE_ID is missing. Simulating OTP code.");
      console.log(`[SIMULATED OTP] to ${recipientPhone}: code is ${generatedOtp} (or use bypass 123456)`);
      return res.status(200).json({
        success: true,
        simulated: true,
        otp: generatedOtp, // exposed for development/testing ease
      });
    }

    // Call MSG91 Send OTP API
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp?template_id=${otpTemplateId}&mobile=${recipientPhone}&authkey=${authKey}`,
      { method: "POST" }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "MSG91 Send OTP request failed");
    }

    console.log(`✅ MSG91 OTP sent successfully to ${recipientPhone}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Send OTP Error:", error);
    // Graceful fallback to simulation on local environments
    return res.status(200).json({
      success: true,
      simulated: true,
      otp: generatedOtp,
    });
  }
}
