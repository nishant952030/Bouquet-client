import { db, isConfigured } from "../../_lib/firebase-server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id || req.url.split("id=")[1]?.split("&")[0];
  if (!id) {
    return res.status(400).json({ error: "Missing shagun ID" });
  }

  if (!isConfigured || !db) {
    return res.status(500).json({ error: "Database not configured" });
  }

  try {
    const shagunRef = db.collection("cards").doc(id);
    const snap = await shagunRef.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Shagun not found" });
    }

    const shagunData = snap.data();

    // Check if there's a claim success record for this shagun
    const claimSnap = await db.collection("cards").doc(`claim_success_${id}`).get();
    if (claimSnap.exists) {
      const claimData = claimSnap.data();
      shagunData.claimStatus = claimData.status || "payout_pending";
      shagunData.status = claimData.status || "payout_pending"; // for compatibility
      shagunData.receiverRealName = claimData.receiverRealName || "";
      shagunData.receiverUpi = claimData.receiverUpi || "";
      shagunData.claimedAt = claimData.claimedAt || "";
      shagunData.utr = claimData.utr || "";
    } else {
      shagunData.claimStatus = "unclaimed";
      shagunData.status = shagunData.status || "unclaimed";
    }

    // Return only necessary non-sensitive fields
    return res.status(200).json({
      id: shagunData.id,
      senderName: shagunData.senderName,
      receiverName: shagunData.receiverName || "",
      amount: shagunData.amount,
      message: shagunData.message || "",
      theme: shagunData.theme || "wedding",
      paymentStatus: shagunData.paymentStatus || "funded",
      status: shagunData.status || "unclaimed",
      claimStatus: shagunData.claimStatus,
      receiverRealName: shagunData.receiverRealName || "",
      receiverUpi: shagunData.receiverUpi || "",
      claimedAt: shagunData.claimedAt || "",
      utr: shagunData.utr || "",
    });
  } catch (error) {
    console.error("❌ Failed to fetch shagun details:", error);
    return res.status(500).json({ error: "Failed to load shagun details" });
  }
}
