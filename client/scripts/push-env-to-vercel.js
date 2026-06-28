/**
 * Script to push all local environment variables from client/.env to Vercel production.
 * Run: node scripts/push-env-to-vercel.js
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.resolve(__dirname, "../.env");
if (!fs.existsSync(envPath)) {
  console.error("❌ client/.env file not found!");
  process.exit(1);
}

const lines = fs.readFileSync(envPath, "utf-8").split("\n");

console.log("🚀 Starting environment variable sync to Vercel...");

for (let line of lines) {
  line = line.trim();
  if (!line || line.startsWith("#")) continue;

  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (!match) continue;

  const key = match[1];
  let value = (match[2] || "").replace(/\r$/, "").trim();

  // Strip wrapping quotes if any
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }

  if (!key || !value) continue;

  console.log(`\n⚙️ Adding key: ${key}...`);

  try {
    // Pipe value to 'vercel env add <key> production' to run it non-interactively
    execSync(`vercel env add ${key} production`, {
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
    });
    console.log(`✅ Success: ${key}`);
  } catch (err) {
    console.error(`❌ Failed to add ${key}:`, err.message);
  }
}

console.log("\n🎉 Environment variable sync completed!");
process.exit(0);
