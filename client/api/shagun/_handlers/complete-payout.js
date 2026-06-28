import process from "node:process";
import { db, isConfigured } from "../_lib/firebase-server.js";

async function sendSmsNotification({ phone, amount, shagunId, utr, receiverName }) {
  const authKey = process.env.MSG91_AUTH_KEY;
  // MSG91 template/flow configuration for SMS
  const templateId = process.env.MSG91_SMS_TEMPLATE_ID;

  let recipientPhone = phone.trim();
  // Strip any leading + if present
  if (recipientPhone.startsWith("+")) {
    recipientPhone = recipientPhone.slice(1);
  }
  // Add 91 prefix if it's 10 digits (common for Indian numbers)
  if (recipientPhone.length === 10 && /^\d+$/.test(recipientPhone)) {
    recipientPhone = "91" + recipientPhone;
  }

  const logMessage = `📱 SMS to ${recipientPhone} [Amount: ₹${amount}, Shagun: ${shagunId}, Recipient: ${receiverName}, UTR: ${utr}]`;

  if (!authKey || !templateId) {
    console.warn("⚠️ MSG91_AUTH_KEY or MSG91_SMS_TEMPLATE_ID is missing. Simulating SMS payout notification.");
    console.log(`[SIMULATED SMS] ${logMessage}: "Hello ${receiverName}, your Shagun gift of ₹${amount} (Ref: ${shagunId}) has been transferred to your bank account via UPI. UTR: ${utr}. Powered by Petals & Words 🌸"`);
    return { simulated: true };
  }

  try {
    const response = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        recipients: [
          {
            mobiles: recipientPhone,
            // Variables mapped inside MSG91 SMS template flow
            amount: String(amount),
            shagunId: shagunId,
            utr: utr,
            name: receiverName,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "MSG91 Flow SMS sending failed");
    }

    console.log(`✅ SMS payout notification triggered via MSG91 to ${recipientPhone}:`, data);
    return data;
  } catch (error) {
    console.error("❌ Failed to send SMS via MSG91:", error);
    // Non-blocking failure so the manual payout completion doesn't rollback
    return { error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { shagunId, utr, adminKey } = req.body || {};

  if (!shagunId || !utr || !utr.trim()) {
    return res.status(400).json({ error: "Shagun ID and transaction UTR are required" });
  }

  // Authorize using environment variables admin key
  const correctAdminKey = process.env.VITE_ADMIN_KEY;
  if (!correctAdminKey || adminKey !== correctAdminKey) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  if (!isConfigured || !db) {
    return res.status(500).json({ error: "Database configuration error" });
  }

  try {
    const shagunRef = db.collection("cards").doc(shagunId);
    const successRef = db.collection("cards").doc(`claim_success_${shagunId}`);

    const docSnap = await shagunRef.get();
    const successSnap = await successRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Shagun envelope not found" });
    }

    if (!successSnap.exists) {
      return res.status(400).json({ error: "Shagun envelope has not been claimed/requested for payout yet" });
    }

    const shagunData = docSnap.data();
    const claimData = successSnap.data();

    if (claimData.status === "claimed") {
      return res.status(400).json({ error: "Payout has already been completed for this shagun" });
    }

    // 1. Update claim success document
    await successRef.update({
      status: "claimed",
      utr: utr.trim(),
      payoutCompletedAt: new Date().toISOString(),
    });

    // 2. Update main envelope document
    await shagunRef.update({
      status: "claimed",
    });

    // 3. Update the Android-readable shagun_payouts collection
    try {
      await db.collection("shagun_payouts").doc(shagunId).update({
        status: "completed",
        utr: utr.trim(),
        completedAt: new Date().toISOString(),
      });
    } catch (_) {
      // Non-fatal if the payout doc doesn't exist (older claims)
    }

    // 3. Trigger SMS notification asynchronously
    const phone = claimData.receiverPhone || "";
    const amount = shagunData.amount || 0;
    const receiverName = claimData.receiverRealName || "Recipient";

    let smsResult = null;
    if (phone) {
      smsResult = await sendSmsNotification({
        phone,
        amount,
        shagunId,
        utr: utr.trim(),
        receiverName,
      });
    }

    return res.status(200).json({
      success: true,
      shagunId,
      status: "claimed",
      smsSent: !!phone,
      smsResult,
    });
  } catch (error) {
    console.error("❌ Failed to complete manual payout:", error);
    return res.status(500).json({ error: error.message || "Manual payout completion processing failed" });
  }
}
