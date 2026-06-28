import process from "node:process";
import { db, isConfigured } from "../_lib/firebase-server.js";

function maskUpi(upi) {
  const parts = upi.split("@");
  if (parts.length !== 2) return upi;
  const username = parts[0];
  const domain = parts[1];
  if (username.length <= 2) return `${username.charAt(0)}*@${domain}`;
  return `${username.charAt(0)}${"*".repeat(username.length - 2)}${username.slice(-1)}@${domain}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { shagunId, upiId, receiverName, phone, upiName } = req.body || {};

  if (!shagunId || !upiId || !upiId.includes("@")) {
    return res.status(400).json({ error: "Invalid Shagun ID or UPI ID" });
  }

  if (!phone || phone.trim().length < 10) {
    return res.status(400).json({ error: "Invalid or missing phone number" });
  }

  if (!isConfigured || !db) {
    return res.status(500).json({ error: "Database configuration error" });
  }

  const shagunRef = db.collection("cards").doc(shagunId);
  const lockRef = db.collection("cards").doc(`claim_lock_${shagunId}`);
  const successRef = db.collection("cards").doc(`claim_success_${shagunId}`);
  let giftAmount = 0;

  try {
    // 1. Transaction lock to prevent double-claiming
    await db.runTransaction(async (transaction) => {
      const successSnap = await transaction.get(successRef);
      if (successSnap.exists) {
        throw new Error("SHAGUN_ALREADY_CLAIMED");
      }

      const lockSnap = await transaction.get(lockRef);
      if (lockSnap.exists) {
        const lockData = lockSnap.data();
        const lockTime = new Date(lockData.createdAt).getTime();
        if (Date.now() - lockTime < 60000) {
          throw new Error("CLAIM_IN_PROGRESS");
        }
      }

      const docSnap = await transaction.get(shagunRef);
      if (!docSnap.exists) {
        throw new Error("SHAGUN_NOT_FOUND");
      }

      const data = docSnap.data();
      if (data.paymentStatus !== "funded" && data.paymentStatus !== "paid") {
        throw new Error("SHAGUN_UNPAID");
      }

      giftAmount = data.amount;

      // Set the lock document inside transaction
      transaction.set(lockRef, {
        id: `claim_lock_${shagunId}`,
        createdAt: new Date().toISOString(),
      });
    });

    // 2. Register payout pending
    try {
      const claimedAt = new Date().toISOString();

      await successRef.set({
        id: `claim_success_${shagunId}`,
        shagunId,
        status: "payout_pending",
        receiverUpi: upiId.trim(),
        receiverRealName: receiverName || "Recipient",
        receiverUpiName: upiName ? upiName.trim() : (receiverName || "Recipient"),
        receiverPhone: phone.trim(),
        claimedAt,
        utr: "",
      });

      // Also write to the clean shagun_payouts collection for the Android app
      const shagunData = (await shagunRef.get()).data() || {};
      await db.collection("shagun_payouts").doc(shagunId).set({
        shagunId,
        amount: giftAmount,
        senderName: shagunData.senderName || "",
        receiverUpi: upiId.trim(),
        upiId: upiId.trim(),
        receiverPhone: phone.trim(),
        receiverUpiName: upiName ? upiName.trim() : (receiverName || "Recipient"),
        status: "pending",
        claimedAt,
        completedAt: "",
        utr: "",
      });

      // Update main envelope status
      await shagunRef.update({
        status: "payout_pending"
      });

      // Release lock
      await lockRef.delete();

      return res.status(200).json({
        success: true,
        amount: giftAmount,
        status: "payout_pending",
      });

    } catch (dbErr) {
      console.error("❌ Failed to write claim record:", dbErr);
      // Try to clean up lock
      try { await lockRef.delete(); } catch (_) {}
      return res.status(500).json({
        error: "Unable to submit your claim. Please try again.",
      });
    }

  } catch (error) {
    console.error("❌ Claim execution failed:", error);

    if (error.message === "SHAGUN_NOT_FOUND") {
      return res.status(404).json({ error: "Shagun gift card not found." });
    }
    if (error.message === "SHAGUN_UNPAID") {
      return res.status(400).json({ error: "This shagun gift has not been paid for by the sender yet." });
    }
    if (error.message === "SHAGUN_ALREADY_CLAIMED") {
      return res.status(400).json({ error: "This shagun gift has already been claimed." });
    }
    if (error.message === "CLAIM_IN_PROGRESS") {
      return res.status(400).json({ error: "A claim is currently being processed. Please wait a minute and retry." });
    }

    return res.status(500).json({
      error: "An error occurred while claiming your shagun. Please try again.",
    });
  }
}
