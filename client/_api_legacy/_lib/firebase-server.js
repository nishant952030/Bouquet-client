import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import process from "node:process";
import fs from "node:fs";
import path from "node:path";

// Manually parse local .env file in development mode
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        value = value.replace(/\r$/, "").trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.warn("⚠️ Failed to parse local .env file:", err.message);
}

const projectId =
  process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

let db = null;
let isConfigured = false;

if (projectId) {
  try {
    let app;
    if (getApps().length === 0) {
      const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountB64) {
        // Preferred: base64-encoded service account JSON stored in env
        const serviceAccount = JSON.parse(
          Buffer.from(serviceAccountB64, "base64").toString("utf-8")
        );
        app = initializeApp({ credential: cert(serviceAccount) });
      } else {
        // Fallback: try loading service account JSON file from project root
        const saPath = path.resolve(process.cwd(), "firebase-service-account.json");
        if (fs.existsSync(saPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"));
          app = initializeApp({ credential: cert(serviceAccount) });
        } else {
          // Last resort: no service account available, Admin SDK can't authenticate
          throw new Error(
            "No Firebase service account found. Add FIREBASE_SERVICE_ACCOUNT env variable or firebase-service-account.json file."
          );
        }
      }
    } else {
      app = getApps()[0];
    }

    db = getFirestore(app);
    isConfigured = true;
    console.log("🔥 Firebase Admin SDK initialized for project:", projectId);
  } catch (err) {
    console.error("❌ Firebase Admin SDK initialization failed:", err.message);
  }
} else {
  console.warn("⚠️ Firebase project ID is missing from environment variables.");
}

export { db, isConfigured };
