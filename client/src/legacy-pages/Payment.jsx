import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { track } from "@vercel/analytics";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { trackEvent } from "../lib/analytics";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";
import { clearCheckoutDraft, loadCheckoutDraft } from "../lib/checkoutStorage";
import AnonymousDeliveryModal from "../components/AnonymousDeliveryModal";

/* -- constants -- */
const PENDING_KEY = "pw_pending_global_checkout";

const TIP_PRESET_INR = { label: "Standard", amount: 49, display: "Rs 49" };
const TIP_PRESET_USD = { label: "Standard", amount: 1.99, display: "$1.99" };
const API_BASE_URL = String(process.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

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
    return "OTHER";
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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .tip-root {
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
    background: linear-gradient(160deg, #fdf6f0 0%, #f8edf0 55%, #fdf0f5 100%);
    color: #3E2723;
  }

  /* Glassmorphism header */
  .tip-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    background: rgba(253,246,240,0.88);
    border-bottom: 1px solid rgba(200,130,140,0.10);
    box-shadow: 0 2px 20px rgba(200,100,120,0.06);
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .au   { animation: fadeUp .5s cubic-bezier(0.34,1.3,0.64,1) forwards; }
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

  /* Glass cards */
  .vv-card {
    background: rgba(255,255,255,0.78);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(200,130,140,0.10), 0 2px 8px rgba(200,100,100,0.06);
    overflow: hidden;
  }
  .vv-card-low { background: rgba(255,243,240,0.6); backdrop-filter: blur(12px); border-radius: 1.5rem; }

  .vv-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem; font-weight: 800;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #a65d5d;
  }

  /* Tip amount buttons */
  .tip-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
    background: rgba(255,255,255,0.7);
    border: 2px solid rgba(200,130,140,0.18);
    border-radius: 1rem;
    padding: 0.85rem 0.5rem;
    cursor: pointer;
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s;
    min-width: 0;
    flex: 1;
  }
  .tip-btn:hover { border-color: rgba(166,93,93,0.4); background: #fff5f4; transform: translateY(-1px); }
  .tip-btn.selected { border-color: #a65d5d; background: #fff5f4; box-shadow: 0 0 0 3px rgba(166,93,93,0.12); }
  .tip-btn .tip-emoji { font-size: 1.3rem; line-height: 1; }
  .tip-btn .tip-amount { font-size: 0.92rem; font-weight: 700; color: #3E2723; }

  /* Shimmer send button — matches landing page */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .tip-cta {
    width: 100%; min-height: 54px;
    border-radius: 9999px;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #ffffff;
    border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.18s ease;
    animation: pw-pulse 2.5s infinite;
  }
  .tip-cta:hover:not(:disabled) { transform: translateY(-2px); }
  .tip-cta:active:not(:disabled) { transform: scale(0.98); }
  .tip-cta:disabled { background: #e4e2de; color: #9e8f90; cursor: not-allowed; box-shadow: none; animation: none; }
  @keyframes tipSpin { to { transform: rotate(360deg); } }
  .tip-spinner {
    width: 15px; height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    animation: tipSpin 0.8s linear infinite;
  }

  /* Share URL box */
  .share-url-box {
    background: rgba(255,243,240,0.7); border: none;
    border-radius: 0.875rem; padding: 12px 16px;
    word-break: break-all; font-size: 13px;
    color: #7b5455; line-height: 1.5;
    font-family: 'Manrope', monospace;
  }

  /* Share buttons */
  .share-btn {
    flex: 1; border-radius: 0.875rem; padding: 0.75rem;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.18s;
  }
  .share-btn:active { transform: scale(0.97); }
  .share-btn:hover { transform: translateY(-1px); }

  /* Ghost btn */
  .vv-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.7);
    color: #7c4343;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    border: 1.5px solid rgba(124,67,67,0.22); border-radius: 9999px;
    padding: 0.35rem 0.9rem;
    cursor: pointer; transition: all 0.15s;
    text-decoration: none;
  }
  .vv-btn-ghost:hover { background: #ffd9d8; border-color: #7c4343; transform: translateY(-1px); }

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
  const { t } = useTranslation();

  const pendingCheckout = useMemo(() => getPending(), []);
  const checkoutDraft = useMemo(() => loadCheckoutDraft(), []);
  const stems = location.state?.stems ?? pendingCheckout?.stems ?? checkoutDraft?.stems ?? [];
  const note = location.state?.note ?? pendingCheckout?.note ?? checkoutDraft?.note ?? "";
  const initName = location.state?.senderName ?? pendingCheckout?.senderName ?? checkoutDraft?.senderName ?? "";
  const musicTrack = location.state?.musicTrack ?? pendingCheckout?.musicTrack ?? checkoutDraft?.musicTrack ?? "none";
  const voiceNote = location.state?.voiceNote ?? pendingCheckout?.voiceNote ?? checkoutDraft?.voiceNote ?? null;

  const hasBouquetData = stems.length > 0 || countWords(note) > 0;
  const flowerCount = stems.length;
  const wordCount = countWords(note);

  const [senderName] = useState(initName);
  const [shareUrl, setShareUrl] = useState(location.state?.shareUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [showAnonModal, setShowAnonModal] = useState(false);

  /* -- Stable preview ID: generated once, reused for the real share URL after payment -- */
  const previewId = useMemo(() => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`, []);

  /* Tip jar state */
  const [countryCode, setCountryCode] = useState(() => getLikelyCountryFromClient());
  const [isDetectingCountry, setIsDetectingCountry] = useState(true);
  const [selectedTip, setSelectedTip] = useState(1); // index into presets
  const [isTipping, setIsTipping] = useState(false);
  const [tipDone, setTipDone] = useState(false);
  const [tipMsg, setTipMsg] = useState("");

  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID;
  const isIndia = countryCode === "IN";
  const isPhilippines = countryCode === "PH";
  const currentTip = isIndia ? TIP_PRESET_INR : TIP_PRESET_USD;

  /* -- Detect country -- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsDetectingCountry(true);
      try {
        const res = await fetch(apiUrl("/api/geo"));
        const data = await readApi(res);
        const c = String(data?.country || "").toUpperCase();
        if (!cancelled) setCountryCode(c || getLikelyCountryFromClient());
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

  /* -- Write preview payload to localStorage as soon as bouquet data is available -- */
  useEffect(() => {
    if (!hasBouquetData) return;
    const previewPayload = {
      stems,
      note,
      senderName: senderName.trim(),
      musicTrack,
      voiceNote,
      plan: "preview",
      isPreview: true,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`bouquet_share_${previewId}`, JSON.stringify(previewPayload));
    } catch { /* localStorage full */ }

    // Cleanup: remove the preview entry when user leaves without paying
    return () => {
      // Only remove if payment hasn't happened (shareUrl stays empty)
      // We use a ref-like trick: read directly from storage
      try {
        const stored = localStorage.getItem(`bouquet_share_${previewId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.isPreview) localStorage.removeItem(`bouquet_share_${previewId}`);
        }
      } catch { /* ignore */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewId, hasBouquetData, musicTrack, voiceNote]);

  /* -- Save bouquet & generate permanent link after payment (reuses previewId) -- */
  const generateShareLink = useCallback(async (provider = "") => {
    if (!hasBouquetData || shareUrl) return false;
    setIsSaving(true);

    // Upgrade the preview entry to a paid entry using the same ID
    // so the URL the user already previewed becomes the real share link
    const payload = {
      stems,
      note,
      senderName: senderName.trim(),
      musicTrack,
      voiceNote,
      plan: "paid",
      isPreview: false,
      createdAt: new Date().toISOString(),
    };

    // Firebase save is best-effort (non-blocking)
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, "bouquets", previewId), payload).catch((err) => {
        console.warn("Firebase save failed (non-fatal):", err.message);
      });
    }

    // Upgrade localStorage entry from preview → paid
    try {
      localStorage.setItem(`bouquet_share_${previewId}`, JSON.stringify(payload));
      localStorage.removeItem(PENDING_KEY);
      clearCheckoutDraft();
    } catch {
      // localStorage full edge case
    }

    const url = `${window.location.origin}/view/${previewId}`;
    setShareUrl(url);
    setIsSaving(false);
    trackEv("bouquet_shared_paid", { flowerCount, wordCount, provider });
    return true;
  }, [flowerCount, hasBouquetData, note, previewId, senderName, shareUrl, stems, wordCount]);

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
            try {
              localStorage.setItem("pw_has_paid", "true");
              window.dispatchEvent(new CustomEvent("pw-payment-success"));
            } catch (e) {}
            trackEv("tip_success", { provider: "razorpay", amount: currentTip.amount });
          } catch {
            setTipDone(true);
            setTipMsg("Thank you! Your payment was received.");
            try {
              localStorage.setItem("pw_has_paid", "true");
              window.dispatchEvent(new CustomEvent("pw-payment-success"));
            } catch (e) {}
            trackEv("tip_success", { provider: "razorpay", amount: currentTip.amount });
          }
          generateShareLink().then(() => setIsTipping(false));
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
          <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💐</p>
          <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.4rem", fontWeight: 400, marginBottom: "0.5rem" }}>
            {t("payment.noBouquetFound")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#6b5e5f", marginBottom: "1.25rem" }}>
            {t("payment.createFirst")}
          </p>
          <Link to="/create" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "linear-gradient(135deg, #7b5455, #ffd9d8 160%)",
            color: "#fff", fontFamily: "'Manrope', sans-serif", fontWeight: 700,
            fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase",
            borderRadius: "9999px", padding: "0.75rem 1.75rem", textDecoration: "none",
            boxShadow: "0 12px 36px rgba(123,84,85,0.22)",
          }}>
            {t("payment.createBouquet")}
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
            {t("payment.creatingLink")}
          </p>
          <p style={{ fontSize: "0.8rem", color: "#9e8f90", marginTop: "0.5rem" }}>{t("payment.justAMoment")}</p>
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link to="/" className="vv-btn-ghost">{t("common.home")}</Link>
            <LanguageSwitcher />
          </div>
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
                ✓
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.1rem", fontWeight: 500, lineHeight: 1.2, marginBottom: "0.4rem", color: "#3d3028" }}>
                {isPhilippines ? (
                  <>Handa na ang iyong <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>bouquet!</em></>
                ) : (
                  <>{t("payment.liveHeadlinePrefix", "Your bouquet is ")} <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>{t("payment.liveHeadlineSuffix", "live!")}</em></>
                )}
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#705f58" }}>
                {isPhilippines ? "I-share ang link sa iyong minamahal sa ibaba" : t("payment.liveDesc", "Share your bouquet link below")}
              </p>
            </div>

            {/* -- Share link card -- */}
            <div className="vv-card au au-2" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
              <p className="vv-label" style={{ marginBottom: "0.6rem" }}>{t("payment.yourShareLink", "Your share link")}</p>
              <div className="share-url-box" style={{ marginBottom: "0.75rem" }}>{shareUrl}</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button onClick={copyLink} className="share-btn" style={{
                  background: copied ? "#166534" : "linear-gradient(135deg, #a65d5d, #7c3f4f)",
                  color: "#fff", flex: "1 1 120px", minHeight: "44px",
                }}>
                  {copied ? (isPhilippines ? "Na-copy na! ✓" : t("common.copied", "Copied")) : (isPhilippines ? "Kopyahin ang Link" : t("common.copyLink", "Copy link"))}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    isPhilippines ? `May munting bouquet akong ginawa para sa'yo! 🌸 ${shareUrl}` : `Here's a bouquet I made for you ${shareUrl}`
                  )}`}
                  target="_blank" rel="noreferrer"
                  className="share-btn"
                  style={{ background: "#25D366", color: "#fff", textDecoration: "none", flex: "1 1 120px", minHeight: "44px" }}
                >
                  <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L.057 23.272a.75.75 0 00.914.914l5.427-1.47A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-5.2-1.501l-.373-.221-3.87 1.048 1.048-3.834-.241-.385A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                  {isPhilippines ? "WhatsApp" : t("payment.whatsapp", "WhatsApp")}
                </a>
                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: "Petals & Words",
                        text: isPhilippines ? "May munting bouquet akong ginawa para sa'yo! 🌸" : "Here's a bouquet I made for you 🌸",
                        url: shareUrl,
                      }).catch(() => {});
                    }}
                    className="share-btn"
                    style={{ background: "linear-gradient(135deg, #0084FF, #00C6FF)", color: "#fff", flex: "1 1 100%", minHeight: "42px" }}
                  >
                    💬 {isPhilippines ? "I-share sa Messenger / Apps" : "Share via Apps"}
                  </button>
                )}
              </div>

              {/* ── Anonymous Delivery CTA ── */}
              <button
                id="anon-delivery-btn"
                onClick={() => setShowAnonModal(true)}
                style={{
                  width: "100%",
                  marginTop: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "linear-gradient(135deg, #1a0a0a 0%, #7b5455 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.875rem",
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  boxShadow: "0 4px 16px rgba(20,0,0,0.25)",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                🕵️ Send Anonymously to Their WhatsApp — {currentTip.display}
              </button>
            </div>
          </>
        ) : (
          <div className="au au-1" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "9999px", margin: "0 auto 1rem",
              background: "linear-gradient(135deg, #fff5f4, #ffd9d8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem",
              boxShadow: "0 8px 24px rgba(123,84,85,0.15)",
            }}>
              💌
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 500, lineHeight: 1.2, marginBottom: "0.4rem", color: "#3d3028" }}>
              {isPhilippines ? (
                <>Napakaganda ng <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>bouquet mo!</em></>
              ) : (
                <>Your bouquet is <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>beautiful!</em></>
              )}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#705f58" }}>
              {isPhilippines ? "Isang hakbang na lang para makuha ang iyong share link" : "One last step to get your shareable link"}
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
              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🎁</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#7b5455", marginTop: "0.2rem" }}>{t("payment.stems", { count: flowerCount })}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {note?.trim() ? (
                <>
                  <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "0.92rem", fontStyle: "italic", color: "#3E2723", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    "{note.trim().slice(0, 80)}{note.trim().length > 80 ? "..." : ""}"
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.25rem" }}>{t("payment.words", { count: wordCount })}</p>
                </>
              ) : (
                <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "0.85rem", fontStyle: "italic", color: "#9e8f90" }}>
                  {t("payment.noNote")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* -- Mandatory payment card -- */}
        {!tipDone ? (
          <div className="vv-card au au-4" style={{ padding: "1.5rem 1.25rem", marginBottom: "1rem", textAlign: "center" }}>
            {/* Celebration icon — NOT a padlock */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "2.5rem" }}>💐</span>
            </div>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.3rem", fontWeight: 400, marginBottom: "0.3rem", color: "#3E2723" }}>
              {isPhilippines ? "Kaunti na lang — gawing totoo" : "Almost there — make it real"}
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#6b5e5f", lineHeight: 1.65, marginBottom: "1.25rem", maxWidth: 300, margin: "0 auto 1.25rem" }}>
              {isPhilippines
                ? "Ang maliit na suporta ay nagpapanatili sa serbisyong ito at nag-aunlock ng iyong permanenteng share link — handang ipadala sa Messenger o WhatsApp!"
                : "A small contribution keeps this platform alive and unlocks your permanent share link — ready to send in seconds."}
            </p>

            {/* Trust pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.25rem" }}>
              {(isPhilippines
                ? ["🔒 Isang beses lang", "⚡ Handa agad ang link", "📵 Walang subscription"]
                : ["🔒 One-time only", "⚡ Link ready instantly", "📵 No subscription"]
              ).map(pill => (
                <span key={pill} style={{
                  fontSize: "0.7rem", fontWeight: 700, color: "#7b5455",
                  background: "#fff5f4", border: "1px solid #ffd9d8",
                  borderRadius: "9999px", padding: "0.25rem 0.75rem",
                  letterSpacing: "0.04em"
                }}>{pill}</span>
              ))}
            </div>

            {/* 👁 Free preview link */}
            {hasBouquetData && (
              <div style={{ marginBottom: "1rem" }}>
                <a
                  href={`/view/${previewId}?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEv("preview_opened", { previewId })}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontSize: "0.8rem", fontWeight: 600,
                    color: "#7b5455",
                    background: "#fff5f4",
                    border: "1.5px solid #ffd9d8",
                    borderRadius: "9999px",
                    padding: "0.45rem 1.1rem",
                    textDecoration: "none",
                    transition: "background 0.15s, border-color 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ffd9d8"; e.currentTarget.style.borderColor = "#7b5455"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff5f4"; e.currentTarget.style.borderColor = "#ffd9d8"; }}
                >
                  {isPhilippines ? "👁 Silipin ang kanilang makikita →" : "👁 Preview what they'll see →"}
                </a>
                <p style={{ fontSize: "0.68rem", color: "#b8a9aa", marginTop: "0.4rem" }}>
                  {isPhilippines ? "Magbubukas sa bagong tab — walang bayad" : "Opens in a new tab — no payment needed"}
                </p>
              </div>
            )}

            {/* Pay button */}
            {isDetectingCountry ? (
              <p style={{ fontSize: "0.78rem", color: "#9e8f90" }}>{t("payment.loadingPayment", "Loading payment option...")}</p>
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
                    {isPhilippines ? "Pinoproseso ang pagbabayad..." : t("payment.processingPayment", "Processing payment...")}
                  </>
                ) : (
                  <>
                    ✨ {isPhilippines ? `Magbayad ng ${currentTip.display} para makuha ang link` : t("payment.payButton", "Pay {{amount}} to get link", { amount: currentTip.display })}
                  </>
                )}
              </button>
            )}

            {tipMsg && (
              <p style={{ fontSize: "0.78rem", color: "#7b5455", marginTop: "0.75rem" }}>{tipMsg}</p>
            )}

            {!isDetectingCountry && (
              <div style={{ marginTop: "0.85rem", fontSize: "0.72rem", color: "#9e8f90", lineHeight: 1.6 }}>
                {isPhilippines
                  ? "Secure checkout · GCash accepted via Razorpay · Walang recurring charges"
                  : isIndia
                  ? "Secure checkout via Razorpay · Card, UPI & wallets · No recurring charges"
                  : "Secure checkout via Razorpay · International cards accepted · Charged in USD · No recurring charges"}
              </div>
            )}
          </div>
        ) : (
          /* -- Thank you state -- */
          <div className="vv-card thank-you-pop au au-4" style={{
            padding: "2rem 1.25rem", marginBottom: "1rem", textAlign: "center",
            background: "linear-gradient(135deg, #fdf4ff, #fce7f3, #fff1f2)",
          }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>💖</span>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.35rem", fontWeight: 400, marginBottom: "0.3rem", color: "#7b5455" }}>
              {isPhilippines ? "Maraming salamat!" : t("payment.thankYouHeadline", "Thank you so much!")}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#6b5e5f", lineHeight: 1.6 }}>
              {isPhilippines
                ? "Napakalaking tulong ng iyong suporta sa amin. Enjoy sa pagpapadala ng pagmamahal gamit ang iyong mga bouquet!"
                : `${t("payment.supportMeansWorld", "Your support means the world to me.")} ${t("payment.enjoySpreadingLove", "Enjoy spreading love with your bouquets.")}`}
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

        {/* -- Cross Promotion -- */}
        {tipDone && (
          <div className="au au-5 vv-card" style={{ padding: "1.25rem", marginBottom: "1rem", textAlign: "center", background: "linear-gradient(135deg, #fff 0%, #fef5f5 100%)", border: "1px solid #ffd9d8" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#7b5455", fontFamily: "'Noto Serif', serif", fontSize: "1.1rem" }}>
              {isPhilippines ? "May nagbi-birthday ba? 🎂" : "Also celebrating a birthday? 🎂"}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#6b5e5f", marginBottom: "1rem" }}>
              {isPhilippines
                ? "Padalhan sila ng customized 3D Virtual Cake na may espesyal na mensahe."
                : "Send them a custom 3D Virtual Cake with a special message."}
            </p>
            <Link to="/create-cake" style={{
              display: "inline-block", background: "linear-gradient(135deg, #d94a78 0%, #f0a23f 180%)", color: "#fff",
              padding: "0.6rem 1.25rem", borderRadius: "99px", textDecoration: "none",
              fontWeight: 600, fontSize: "0.85rem", boxShadow: "0 4px 12px rgba(217, 74, 120, 0.2)"
            }}>
              {isPhilippines ? "Gumawa ng Cake" : "Build a Cake"}
            </Link>
          </div>
        )}

        {/* -- Back to create -- */}
        <div className="au au-5" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
          <Link to="/create" style={{ fontSize: "0.78rem", color: "#9e8f90", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            {isPhilippines ? "Gumawa ng isa pang bouquet" : t("payment.createAnother", "Create another bouquet")}
          </Link>
        </div>

      </div>

      {/* Anonymous Delivery Modal */}
      {showAnonModal && shareUrl && (
        <AnonymousDeliveryModal
          giftUrl={shareUrl}
          giftType="bouquet"
          onClose={() => setShowAnonModal(false)}
        />
      )}
    </main>
  );
}




