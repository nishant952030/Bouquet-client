/**
 * Seed script: Populates Firestore `shagun_payouts` collection with dummy documents
 * Run: node scripts/seed-shagun-payouts.js
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || "").replace(/\r$/, "").trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (e) { /* silent */ }

// Init Admin SDK
const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountB64) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT env var missing.");
  process.exit(1);
}
const serviceAccount = JSON.parse(Buffer.from(serviceAccountB64, "base64").toString("utf-8"));
const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
const db = getFirestore(app);

// ── Dummy documents ──────────────────────────────────────────────────────────
const dummyPayouts = [
  {
    shagunId: "shg_demo_001",
    amount: 501,
    senderName: "Ramesh Kumar",
    receiverUpi: "priya.sharma@okicici",
    upiId: "priya.sharma@okicici",
    receiverPhone: "9876543210",
    receiverUpiName: "Priya Sharma",
    status: "pending",
    claimedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
    completedAt: "",
    utr: "",
  },
  {
    shagunId: "shg_demo_002",
    amount: 1001,
    senderName: "Sunita Patel",
    receiverUpi: "rahul.verma@ybl",
    upiId: "rahul.verma@ybl",
    receiverPhone: "9123456789",
    receiverUpiName: "Rahul Verma",
    status: "pending",
    claimedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    completedAt: "",
    utr: "",
  },
  {
    shagunId: "shg_demo_003",
    amount: 2100,
    senderName: "Ankit Mehta",
    receiverUpi: "deepa.joshi@paytm",
    upiId: "deepa.joshi@paytm",
    receiverPhone: "9988776655",
    receiverUpiName: "Deepa Joshi",
    status: "completed",
    claimedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    utr: "UTR427836190245",
  },
  {
    shagunId: "shg_demo_004",
    amount: 500,
    senderName: "Kavita Singh",
    receiverUpi: "mohan.das@upi",
    upiId: "mohan.das@upi",
    receiverPhone: "9811223344",
    receiverUpiName: "Mohan Das",
    status: "pending",
    claimedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    completedAt: "",
    utr: "",
  },
  {
    shagunId: "shg_demo_005",
    amount: 5100,
    senderName: "Vikram Nair",
    receiverUpi: "neha.gupta@okhdfc",
    upiId: "neha.gupta@okhdfc",
    receiverPhone: "9700011122",
    receiverUpiName: "Neha Gupta",
    status: "completed",
    claimedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    utr: "UTR918273640912",
  },
];

async function seed() {
  console.log("🌱 Seeding shagun_payouts collection...\n");
  const col = db.collection("shagun_payouts");
  for (const doc of dummyPayouts) {
    await col.doc(doc.shagunId).set(doc);
    const icon = doc.status === "pending" ? "⏳" : "✅";
    console.log(`  ${icon}  ${doc.shagunId}  |  ₹${doc.amount}  |  ${doc.receiverUpi}  |  ${doc.receiverPhone}  →  ${doc.status}`);
  }
  console.log(`\n✅ Done! ${dummyPayouts.length} documents written to Firestore → shagun_payouts`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
