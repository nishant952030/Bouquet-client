import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { track } from "@vercel/analytics";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { trackEvent } from "../lib/analytics";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";
import { clearCheckoutDraft, loadCheckoutDraft } from "../lib/checkoutStorage";

/* -- constants -- */
const PENDING_KEY = "pw_pending_global_checkout";

const TIP_PRESETS_INR = [
  { label: "Basic", amount: 19, display: "Rs 19" },
  { label: "Popular", amount: 39, display: "Rs 39" },
  { label: "Supporter", amount: 59, display: "Rs 59" },
];
const TIP_PRESETS_USD = [
  { label: "Basic", amount: 0.99, display: "$0.99" },
  { label: "Popular", amount: 1.49, display: "$1.49" },
  { label: "Supporter", amount: 1.99, display: "$1.99" },
];
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const TEST_COUNTRY_OVERRIDE = "US"; // Temporary override for testing non-India flow

/* -- helpers -- */
function countWords(text) {
  const n = String(text || "").trim();
  return n ? n.split(/\s+/).length : 0;
}
function trackEv(name, payload) {
  track(name, payload);
  trackEvent(name, payload);
}
function getLikelyCountryFromClient() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = String(navigator?.language || "").toUpperCase();
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || locale.includes("-IN")) return "IN";
    return "PH";
  } catch {
    return "IN";
  }
}
function getPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return Array.isArray(p?.stems) ? p : null;
  } catch { return null; }
}
async function readApi(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { return await res.json(); } catch { return null; }
  }
  try { const t = await res.text(); return t ? { error: t } : null; } catch { return null; }
}
function apiUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

/* -- CSS -- */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .tip-root {
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
    background: #fbf9f5;
    color: #3E2723;
  }

  /* Header glass */
  .tip-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(251,249,245,0.88);
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .au   { animation: fadeUp .45s ease forwards; }
  .au-1 { animation-delay:.05s; opacity:0; }
  .au-2 { animation-delay:.15s; opacity:0; }
  .au-3 { animation-delay:.25s; opacity:0; }
  .au-4 { animation-delay:.35s; opacity:0; }
  .au-5 { animation-delay:.45s; opacity:0; }

  @keyframes checkPop {
    0%  { transform:scale(0) rotate(-10deg); opacity:0; }
    70% { transform:scale(1.2) rotate(4deg);  opacity:1; }
    100%{ transform:scale(1) rotate(0deg);    opacity:1; }
  }
  .check-pop { animation: checkPop .5s cubic-bezier(.34,1.56,.64,1) forwards; }

  /* Cards */
  .vv-card {
    background: #ffffff;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(27,28,26,0.06), 0 2px 6px rgba(27,28,26,0.04);
    overflow: hidden;
  }
  .vv-card-low { background: #f5f3ef; border-radius: 1.5rem; }

  .vv-label {
    font-family: 'Manrope', sans-serif;
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #7b5455;
  }

  /* Tip amount buttons */
  .tip-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
    background: #f5f3ef;
    border: 2px solid transparent;
    border-radius: 1rem;
    padding: 0.85rem 0.5rem;
    cursor: pointer;
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s;
    min-width: 0;
    flex: 1;
  }
  .tip-btn:hover { border-color: #d2c3c4; background: #ffd9d8; }
  .tip-btn.selected { border-color: #7b5455; background: #fff5f4; }
  .tip-btn .tip-emoji { font-size: 1.3rem; line-height: 1; }
  .tip-btn .tip-amount { font-size: 0.92rem; font-weight: 700; color: #3E2723; }

  /* Send tip button */
  .tip-cta {
    width: 100%; min-height: 52px;
    border-radius: 9999px;
    background: linear-gradient(135deg, #7b5455 0%, #ffd9d8 160%);
    color: #ffffff;
    border: none;
    font-family: 'Manrope', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.18s ease;
    box-shadow: 0 12px 36px rgba(123,84,85,0.22);
  }
  .tip-cta:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 18px 44px rgba(123,84,85,0.3);
  }
  .tip-cta:active:not(:disabled) { transform: scale(0.98); }
  .tip-cta:disabled { background: #e4e2de; color: #9e8f90; cursor: not-allowed; box-shadow: none; }
  @keyframes tipSpin {
    to { transform: rotate(360deg); }
  }
  .tip-spinner {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #ffffff;
    animation: tipSpin 0.8s linear infinite;
  }

  /* Success share card */
  .share-url-box {
    background: #f5f3ef; border: none;
    border-radius: 0.875rem; padding: 12px 16px;
    word-break: break-all; font-size: 13px;
    color: #7b5455; line-height: 1.5;
    font-family: 'Manrope', monospace;
  }

  /* Copy / WhatsApp buttons */
  .share-btn {
    flex: 1; border-radius: 0.875rem; padding: 0.75rem;
    font-family: 'Manrope', sans-serif;
    font-size: 0.78rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.15s;
  }
  .share-btn:active { transform: scale(0.97); }

  /* Ghost btn */
  .vv-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: transparent;
    color: #7b5455;
    font-family: 'Manrope', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    border: 1.5px solid rgba(210,195,196,0.5);
    border-radius: 9999px;
    padding: 0.35rem 0.9rem;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
    text-decoration: none;
  }
  .vv-btn-ghost:hover { background: #ffd9d8; border-color: #7b5455; }

  /* Thank-you pop */
  @keyframes thankYouPop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  .thank-you-pop { animation: thankYouPop 0.4s ease forwards; }

  /* Coffee steam */
  @keyframes steam {
    0%   { opacity: 0; transform: translateY(0) scaleX(1); }
    50%  { opacity: 0.7; transform: translateY(-8px) scaleX(1.1); }
    100% { opacity: 0; transform: translateY(-18px) scaleX(0.8); }
  }
  .steam-1 { animation: steam 2s ease-in-out infinite; }
  .steam-2 { animation: steam 2s ease-in-out infinite 0.4s; }
  .steam-3 { animation: steam 2s ease-in-out infinite 0.8s; }
`;

/* -- MAIN COMPONENT -- */
export default function Payment() {
  const location = useLocation();

  const pendingCheckout = useMemo(() => getPending(), []);
  const checkoutDraft = useMemo(() => loadCheckoutDraft(), []);
  const stems = location.state?.stems ?? pendingCheckout?.stems ?? checkoutDraft?.stems ?? [];
  const note = location.state?.note ?? pendingCheckout?.note ?? checkoutDraft?.note ?? "";
  const initName = location.state?.senderName ?? pendingCheckout?.senderName ?? checkoutDraft?.senderName ?? "";

  const hasBouquetData = stems.length > 0 || countWords(note) > 0;
  const flowerCount = stems.length;
  const wordCount = countWords(note);

  const [senderName] = useState(initName);
  const [shareUrl, setShareUrl] = useState(location.state?.shareUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  /* Tip jar state */
  const [countryCode, setCountryCode] = useState(() => getLikelyCountryFromClient());
  const [isDetectingCountry, setIsDetectingCountry] = useState(true);
  const [selectedTip, setSelectedTip] = useState(1); // index into presets
  const [isTipping, setIsTipping] = useState(false);
  const [tipDone, setTipDone] = useState(false);
  const [tipMsg, setTipMsg] = useState("");

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isIndia = countryCode === "IN";
  const tipPresets = isIndia ? TIP_PRESETS_INR : TIP_PRESETS_USD;
  const currentTip = tipPresets[selectedTip];

  /* -- Detect country -- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsDetectingCountry(true);
      if (TEST_COUNTRY_OVERRIDE) {
        if (!cancelled) {
          setCountryCode(String(TEST_COUNTRY_OVERRIDE).toUpperCase());
          setIsDetectingCountry(false);
        }
        return;
      }
      try {
        const res = await fetch(apiUrl("/api/geo"));
        const data = await readApi(res);
        const c = String(data?.country || "").toUpperCase();
        const likely = getLikelyCountryFromClient();
        const resolved = c === "PH" && likely === "IN" ? "IN" : (c || likely);
        if (!cancelled) setCountryCode(resolved);
      } catch {
        if (!cancelled) setCountryCode(getLikelyCountryFromClient());
      } finally {
        if (!cancelled) setIsDetectingCountry(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* -- SEO -- */
  useEffect(() => {
    applySeo({
      title: "Your Bouquet is Ready! | Petals and Words",
      description: "Your digital bouquet is ready to share. Copy the link and send it!",
      keywords: seoKeywords.payment,
      path: "/payment",
      robots: "noindex,nofollow",
    });
  }, []);

  /* -- Save bouquet & generate link only after payment -- */
  const generateShareLink = useCallback(async (provider) => {
    if (!hasBouquetData || shareUrl) return false;
    setIsSaving(true);
    const id = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      stems,
      note,
      senderName: senderName.trim(),
      plan: "paid",
      createdAt: new Date().toISOString(),
    };

    // Firebase save is best-effort
    try {
      if (isFirebaseConfigured && db) await setDoc(doc(db, "bouquets", id), payload);
    } catch (err) {
      console.warn("Firebase save failed (non-fatal):", err.message);
    }

    // Always save locally and generate the share link
    try {
      localStorage.setItem(`bouquet_share_${id}`, JSON.stringify(payload));
      localStorage.removeItem(PENDING_KEY);
      clearCheckoutDraft();
    } catch {
      // localStorage full edge case
    }

    const url = `${window.location.origin}/view/${id}`;
    setShareUrl(url);
    setIsSaving(false);
    trackEv("bouquet_shared_paid", { flowerCount, wordCount, provider });
    return true;
  }, [flowerCount, hasBouquetData, note, senderName, shareUrl, stems, wordCount]);

  /* -- Copy link -- */
  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { setStatusMsg("Copy failed — try selecting the text manually."); }
  };

  /* -- Razorpay tip -- */
  const startRazorpayTip = async () => {
    if (isTipping) return;
    if (!razorpayKeyId) {
      setTipMsg("Payment setup is incomplete. Razorpay key is missing.");
      return;
    }
    setTipMsg("");
    setIsTipping(true);

    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Check ad-blocker/network and try again.");
      }

      const currency = isIndia ? "INR" : "USD";
      const amountMinor = Math.round(currentTip.amount * 100);
      trackEv("tip_attempt", { provider: "razorpay", amount: currentTip.amount, currency });

      const orderRes = await fetch(apiUrl("/api/razorpay/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "tip",
          amountMinor,
          currency,
          receipt: `tip_${Date.now()}`,
          notes: { type: "buy_me_a_coffee", amount: currentTip.amount },
        }),
      });
      const orderData = await readApi(orderRes);
      if (!orderRes.ok || !orderData?.orderId) {
        if (orderRes.status === 404) {
          throw new Error(
            "Payment API endpoint not found (HTTP 404). Deploy backend API routes or set VITE_API_BASE_URL to your API host."
          );
        }
        const detail = orderData?.error || `HTTP ${orderRes.status}`;
        throw new Error(`Unable to create payment order (${detail}).`);
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        order_id: orderData.orderId,
        currency: orderData.currency || currency,
        name: "Petals and Words",
        description: "Unlock bouquet share link",
        theme: { color: "#7b5455" },
        modal: {
          ondismiss: () => {
            setIsTipping(false);
            setTipMsg("Payment cancelled. Complete payment to unlock your share link.");
            trackEv("tip_cancelled", { provider: "razorpay" });
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(apiUrl("/api/razorpay/verify"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await readApi(verifyRes);
            if (!verifyRes.ok || !verifyData?.ok) throw new Error("Verification failed");
            setTipDone(true);
            setTipMsg("");
            trackEv("tip_success", { provider: "razorpay", amount: currentTip.amount });
          } catch {
            setTipDone(true);
            setTipMsg("Thank you! We received your payment.");
            trackEv("tip_success", { provider: "razorpay", amount: currentTip.amount });
          }
          await generateShareLink("razorpay");
          setIsTipping(false);
        },
      });

      razorpay.on("payment.failed", () => {
        setIsTipping(false);
        setTipMsg("Payment didn't go through. Please try again to get your share link.");
        trackEv("tip_failed", { provider: "razorpay" });
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setTipMsg(err?.message || "Couldn't start payment. Please try again.");
      setIsTipping(false);
    }
  };

  /* -- No bouquet data -- */
  if (!hasBouquetData) {
    return (
      <main className="tip-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <div className="vv-card" style={{ maxWidth: 380, padding: "2rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>Bouquet</p>
          <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.4rem", fontWeight: 400, marginBottom: "0.5rem" }}>
            No bouquet found
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#6b5e5f", marginBottom: "1.25rem" }}>
            Create your bouquet first, then come back to share it.
          </p>
          <Link to="/create" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "linear-gradient(135deg, #7b5455, #ffd9d8 160%)",
            color: "#fff", fontFamily: "'Manrope', sans-serif", fontWeight: 700,
            fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase",
            borderRadius: "9999px", padding: "0.75rem 1.75rem", textDecoration: "none",
            boxShadow: "0 12px 36px rgba(123,84,85,0.22)",
          }}>
            Create Bouquet
          </Link>
        </div>
      </main>
    );
  }

  /* -- Saving state -- */
  if (isSaving) {
    return (
      <main className="tip-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <div className="vv-card" style={{ maxWidth: 380, padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, margin: "0 auto 1rem", border: "3px solid #f5f3ef", borderTop: "3px solid #7b5455", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.15rem", fontWeight: 400, color: "#3E2723" }}>
            Creating your bouquet link...
          </p>
          <p style={{ fontSize: "0.8rem", color: "#9e8f90", marginTop: "0.5rem" }}>Just a moment...</p>
        </div>
      </main>
    );
  }

  /* -- Main: success + tip jar -- */
  return (
    <main className="tip-root" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <style>{CSS}</style>

      {/* Header */}
      <header className="tip-header">
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/logo-transparent.png" alt="Petals and Words" style={{ height: 30, width: "auto" }} />
          <Link to="/" className="vv-btn-ghost">Back Home</Link>
        </div>
      </header>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>

        {tipDone ? (
          <>
            {/* -- Success header -- */}
            <div className="au au-1" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div className="check-pop" style={{
                width: 64, height: 64, borderRadius: "9999px", margin: "0 auto 1rem",
                background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.75rem",
                boxShadow: "0 8px 24px rgba(34,197,94,0.2)",
              }}>
                Paid
              </div>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.65rem", fontWeight: 400, lineHeight: 1.25, marginBottom: "0.4rem" }}>
                Your bouquet is <em style={{ color: "#7b5455" }}>live!</em>
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#6b5e5f" }}>
                Share your bouquet link below
              </p>
            </div>

            {/* -- Share link card -- */}
            <div className="vv-card au au-2" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
              <p className="vv-label" style={{ marginBottom: "0.6rem" }}>Your share link</p>
              <div className="share-url-box" style={{ marginBottom: "0.75rem" }}>{shareUrl}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={copyLink} className="share-btn" style={{
                  background: copied ? "#166534" : "#7b5455",
                  color: "#fff",
                }}>
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Here's a bouquet I made for you ${shareUrl}`
                  )}`}
                  target="_blank" rel="noreferrer"
                  className="share-btn"
                  style={{ background: "#25D366", color: "#fff", textDecoration: "none" }}
                >
                  <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L.057 23.272a.75.75 0 00.914.914l5.427-1.47A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-5.2-1.501l-.373-.221-3.87 1.048 1.048-3.834-.241-.385A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </>
        ) : (
          <div className="au au-1" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "9999px", margin: "0 auto 1rem",
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem",
            }}>
              Lock
            </div>
            <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.65rem", fontWeight: 400, lineHeight: 1.25, marginBottom: "0.4rem" }}>
              Your bouquet is <em style={{ color: "#7b5455" }}>ready!</em>
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#6b5e5f" }}>
              Complete payment to get your share link
            </p>
          </div>
        )}

        {/* -- Bouquet preview -- */}
        <div className="vv-card au au-3" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              background: "#ffd9d8", borderRadius: "0.875rem", padding: "0.6rem 0.75rem",
              display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56,
            }}>
              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>Gift</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#7b5455", marginTop: "0.2rem" }}>{flowerCount} stems</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {note?.trim() ? (
                <>
                  <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "0.92rem", fontStyle: "italic", color: "#3E2723", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    "{note.trim().slice(0, 80)}{note.trim().length > 80 ? "..." : ""}"
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.25rem" }}>{wordCount} words</p>
                </>
              ) : (
                <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "0.85rem", fontStyle: "italic", color: "#9e8f90" }}>
                  No note added — bouquet only
                </p>
              )}
            </div>
          </div>
        </div>

        {/* -- Mandatory payment card -- */}
        {!tipDone ? (
          <div className="vv-card au au-4" style={{ padding: "1.5rem 1.25rem", marginBottom: "1rem", textAlign: "center" }}>
            {/* Payment icon */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2.2rem" }}>Secure</span>
            </div>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.25rem", fontWeight: 400, marginBottom: "0.3rem" }}>
              Complete Payment
            </h2>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.8rem" }}>
              <a href="https://razorpay.com/" target="_blank" rel="noreferrer">
                <img
                  referrerPolicy="origin"
                  src="https://badges.razorpay.com/badge-dark.png"
                  style={{ height: 45, width: 113 }}
                  alt="Razorpay | Payment Gateway | Neobank"
                  loading="lazy"
                />
              </a>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#6b5e5f", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Pay a small amount to generate your unique share link.<br />
              Your bouquet will be saved after payment.
            </p>

            {/* Tip presets */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {tipPresets.map((preset, i) => (
                <button
                  key={preset.display}
                  type="button"
                  className={`tip-btn ${selectedTip === i ? "selected" : ""}`}
                  onClick={() => setSelectedTip(i)}
                >
                  <span className="tip-emoji">{preset.label}</span>
                  <span className="tip-amount">{preset.display}</span>
                </button>
              ))}
            </div>

            {/* Pay button — Razorpay for all countries */}
            {isDetectingCountry ? (
              <p style={{ fontSize: "0.78rem", color: "#9e8f90" }}>Loading payment option...</p>
            ) : (
              <button
                type="button"
                onClick={startRazorpayTip}
                disabled={isTipping || isSaving}
                className="tip-cta"
              >
                {isTipping ? (
                  <>
                    <span className="tip-spinner" />
                    Processing payment...
                  </>
                ) : (
                  `Pay ${currentTip.display} to get link`
                )}
              </button>
            )}

            {tipMsg && (
              <p style={{ fontSize: "0.78rem", color: "#7b5455", marginTop: "0.75rem" }}>{tipMsg}</p>
            )}

            {!isDetectingCountry && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.74rem", color: "#7b5455", lineHeight: 1.5 }}>
                {isIndia
                  ? "Trusted checkout via Razorpay. Card, UPI, and wallets supported."
                  : "Trusted checkout via Razorpay. International cards are supported and charged in USD."}
              </div>
            )}

            <p style={{ fontSize: "0.7rem", color: "#c4b5b6", marginTop: "0.75rem" }}>
              Payment is required to unlock your share link
            </p>
          </div>
        ) : (
          /* -- Thank you state -- */
          <div className="vv-card thank-you-pop au au-4" style={{
            padding: "2rem 1.25rem", marginBottom: "1rem", textAlign: "center",
            background: "linear-gradient(135deg, #fdf4ff, #fce7f3, #fff1f2)",
          }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>Thank you</span>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.35rem", fontWeight: 400, marginBottom: "0.3rem", color: "#7b5455" }}>
              Thank you so much!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#6b5e5f", lineHeight: 1.6 }}>
              Your support means the world to me.<br />
              Enjoy spreading love with your bouquets.
            </p>
          </div>
        )}

        {/* -- Status message -- */}
        {statusMsg && (
          <div style={{
            borderRadius: "0.875rem", background: "#fef2f2", padding: "0.75rem 1rem",
            fontSize: "0.82rem", color: "#991b1b", marginBottom: "1rem",
          }}>
            {statusMsg}
          </div>
        )}

        {/* -- Back to create -- */}
        <div className="au au-5" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
          <Link to="/create" style={{ fontSize: "0.78rem", color: "#9e8f90", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            Create another bouquet
          </Link>
        </div>

      </div>
    </main>
  );
}



