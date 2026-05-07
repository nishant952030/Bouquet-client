import { collection, addDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

/* ── Helpers ─────────────────────────────────────────────── */

function generateId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getVisitorId() {
  const key = "pw_vid";
  let vid = localStorage.getItem(key);
  if (!vid) {
    vid = generateId();
    localStorage.setItem(key, vid);
  }
  return vid;
}

function getSessionId() {
  const key = "pw_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = generateId();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function isAdmin() {
  try {
    return localStorage.getItem("pw_admin") === "true";
  } catch {
    return false;
  }
}

function getDeviceType() {
  const w = window.screen.width;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getCountryFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const map = {
      "Asia/Kolkata": "India", "Asia/Calcutta": "India",
      "Asia/Colombo": "Sri Lanka",
      "America/New_York": "USA", "America/Chicago": "USA", "America/Denver": "USA",
      "America/Los_Angeles": "USA", "America/Phoenix": "USA",
      "America/Toronto": "Canada", "America/Vancouver": "Canada",
      "Europe/London": "UK", "Europe/Dublin": "Ireland",
      "Europe/Paris": "France", "Europe/Berlin": "Germany",
      "Europe/Madrid": "Spain", "Europe/Rome": "Italy",
      "Europe/Amsterdam": "Netherlands",
      "Australia/Sydney": "Australia", "Australia/Melbourne": "Australia",
      "Australia/Perth": "Australia",
      "Asia/Tokyo": "Japan", "Asia/Seoul": "South Korea",
      "Asia/Shanghai": "China", "Asia/Hong_Kong": "China",
      "Asia/Singapore": "Singapore",
      "Asia/Dubai": "UAE", "Asia/Riyadh": "Saudi Arabia",
      "Asia/Karachi": "Pakistan", "Asia/Dhaka": "Bangladesh",
      "Asia/Manila": "Philippines", "Asia/Jakarta": "Indonesia",
      "America/Mexico_City": "Mexico",
      "America/Sao_Paulo": "Brazil", "America/Argentina/Buenos_Aires": "Argentina",
      "Africa/Lagos": "Nigeria", "Africa/Cairo": "Egypt",
      "Africa/Nairobi": "Kenya", "Africa/Johannesburg": "South Africa",
      "Pacific/Auckland": "New Zealand",
    };
    if (map[tz]) return map[tz];
    // Fallback: extract region from timezone
    const parts = tz.split("/");
    if (parts[0] === "Asia") return "Asia (Other)";
    if (parts[0] === "Europe") return "Europe (Other)";
    if (parts[0] === "America") return "Americas (Other)";
    if (parts[0] === "Africa") return "Africa (Other)";
    return "Other";
  } catch {
    return "Unknown";
  }
}

function getReferrerSource() {
  const ref = document.referrer;
  if (!ref) return "Direct";
  try {
    const hostname = new URL(ref).hostname.toLowerCase();
    if (hostname.includes("google")) return "Google";
    if (hostname.includes("bing")) return "Bing";
    if (hostname.includes("yahoo")) return "Yahoo";
    if (hostname.includes("facebook") || hostname.includes("fb.com")) return "Facebook";
    if (hostname.includes("instagram")) return "Instagram";
    if (hostname.includes("twitter") || hostname.includes("x.com")) return "Twitter/X";
    if (hostname.includes("youtube")) return "YouTube";
    if (hostname.includes("reddit")) return "Reddit";
    if (hostname.includes("tiktok")) return "TikTok";
    if (hostname.includes("whatsapp") || hostname.includes("wa.me")) return "WhatsApp";
    if (hostname.includes("t.me") || hostname.includes("telegram")) return "Telegram";
    if (hostname.includes("pinterest")) return "Pinterest";
    if (hostname.includes("linkedin")) return "LinkedIn";
    // If it's the same site, it's internal navigation (don't count as referrer)
    if (hostname.includes("petalsandwords")) return "Internal";
    return hostname;
  } catch {
    return "Other";
  }
}

/* ── Main Tracker ────────────────────────────────────────── */

let lastTrackedPath = null;

export function trackPageViewFirestore(pathname) {
  // Skip if admin
  if (isAdmin()) return;

  // Skip duplicate consecutive paths (e.g. re-renders)
  if (pathname === lastTrackedPath) return;
  lastTrackedPath = pathname;

  // Skip the admin route itself
  if (pathname === "/admin") return;

  if (!isFirebaseConfigured || !db) return;

  const now = new Date();

  const payload = {
    path: pathname,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    deviceType: getDeviceType(),
    country: getCountryFromTimezone(),
    referrer: getReferrerSource(),
    timestamp: now.toISOString(),
    date: now.toISOString().split("T")[0], // "2026-05-07"
    hour: now.getHours(),
  };

  addDoc(collection(db, "page_views"), payload).catch((err) => {
    console.debug("Tracker write failed:", err.message);
  });
}

export { isAdmin, getVisitorId };
