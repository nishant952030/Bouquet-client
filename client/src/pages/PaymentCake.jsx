import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { track } from "@vercel/analytics";
import { trackEvent } from "../lib/analytics";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";

const TIP_PRESETS_INR = [
  { labelKey: "payment.tipBasic", fallback: "Basic", amount: 9, display: "Rs 9" },
  { labelKey: "payment.tipPopular", fallback: "Popular", amount: 19, display: "Rs 19" },
  { labelKey: "payment.tipSupporter", fallback: "Supporter", amount: 29, display: "Rs 29" },
];
const TIP_PRESETS_USD = [
  { labelKey: "payment.tipBasic", fallback: "Basic", amount: 0.49, display: "$0.49" },
  { labelKey: "payment.tipPopular", fallback: "Popular", amount: 0.99, display: "$0.99" },
  { labelKey: "payment.tipSupporter", fallback: "Supporter", amount: 1.49, display: "$1.49" },
];
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const BYPASS_CAKE_PAYMENT_FOR_TESTING = false;

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
function createCakeId() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}
function compactPosition(item) {
  return {
    x: Number(item?.x || 0),
    y: Number(item?.y || 0),
    z: Number(item?.z || 0),
  };
}
function compactTopping(item) {
  return {
    type: item?.type || "cherry",
    x: Number(item?.x || 0),
    y: Number(item?.y || 0),
    z: Number(item?.z || 0),
    rotation: Number(item?.rotation || 0),
    colorIndex: Number(item?.colorIndex || 0),
  };
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

  .tip-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(251,249,245,0.88);
  }

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

  .vv-card {
    background: #ffffff;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(27,28,26,0.06), 0 2px 6px rgba(27,28,26,0.04);
    overflow: hidden;
  }

  .vv-label {
    font-family: 'Manrope', sans-serif;
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #7b5455;
  }

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
  .tip-btn.selected { border-color: #e91e63; background: #fce4ec; }
  .tip-btn .tip-emoji { font-size: 1.3rem; line-height: 1; }
  .tip-btn .tip-amount { font-size: 0.92rem; font-weight: 700; color: #3E2723; }

  .tip-cta {
    width: 100%; min-height: 52px;
    border-radius: 9999px;
    background: linear-gradient(135deg, #e91e63 0%, #f48fb1 160%);
    color: #ffffff;
    border: none;
    font-family: 'Manrope', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.18s ease;
    box-shadow: 0 12px 36px rgba(233,30,99,0.22);
  }
  .tip-cta:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 18px 44px rgba(233,30,99,0.3);
  }
  .tip-cta:active:not(:disabled) { transform: scale(0.98); }
  .tip-cta:disabled { background: #e4e2de; color: #9e8f90; cursor: not-allowed; box-shadow: none; }

  @keyframes tipSpin { to { transform: rotate(360deg); } }
  .tip-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #ffffff;
    animation: tipSpin 0.8s linear infinite;
  }

  .share-url-box {
    background: #f5f3ef; border: none;
    border-radius: 0.875rem; padding: 12px 16px;
    word-break: break-all; font-size: 13px;
    color: #e91e63; line-height: 1.5;
    font-family: 'Manrope', monospace;
  }

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

  .vv-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: transparent; color: #e91e63;
    font-family: 'Manrope', sans-serif; font-size: 0.78rem; font-weight: 600;
    border: 1.5px solid rgba(233,30,99,0.3);
    border-radius: 9999px; padding: 0.35rem 0.9rem;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
    text-decoration: none;
  }
  .vv-btn-ghost:hover { background: #fce4ec; border-color: #e91e63; }

  @keyframes thankYouPop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  .thank-you-pop { animation: thankYouPop 0.4s ease forwards; }
`;

export default function PaymentCake() {
  const location = useLocation();
  const { t } = useTranslation();

  const name = location.state?.name || "";
  const flavor = location.state?.flavor || "chocolate";
  const age = location.state?.age || 3;
  const note = location.state?.note || "";
  const tiers = location.state?.tiers || 1;
  const candles = Array.isArray(location.state?.candles) ? location.state.candles : [];
  const creamSwirls = Array.isArray(location.state?.creamSwirls) ? location.state.creamSwirls : [];
  const toppings = Array.isArray(location.state?.toppings) ? location.state.toppings : [];

  const hasCakeData = Boolean(name);
  const wordCount = countWords(note);

  const [shareUrl, setShareUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [countryCode, setCountryCode] = useState(() => getLikelyCountryFromClient());
  const [isDetectingCountry, setIsDetectingCountry] = useState(true);
  const [selectedTip, setSelectedTip] = useState(1); 
  const [isTipping, setIsTipping] = useState(false);
  const [tipDone, setTipDone] = useState(false);
  const [tipMsg, setTipMsg] = useState("");

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isIndia = countryCode === "IN";
  const tipPresets = isIndia ? TIP_PRESETS_INR : TIP_PRESETS_USD;
  const currentTip = tipPresets[selectedTip];

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

  useEffect(() => {
    applySeo({
      title: "Your Cake is Ready! | Petals and Words",
      description: "Your digital cake is ready. Copy the link and send it!",
      keywords: ["cake", "share cake", "digital cake"],
      path: "/payment-cake",
      robots: "noindex,nofollow",
    });
  }, []);

  const generateShareLink = useCallback(async (provider) => {
    if (!hasCakeData || shareUrl) return false;
    setIsSaving(true);
    const id = createCakeId();
    const payload = {
      v: 2,
      name,
      flavor,
      tiers: Number(tiers) || 1,
      candleCount: parseInt(age) || Math.max(candles.length, 1),
      note,
      candles: candles.map(compactPosition),
      creamSwirls: creamSwirls.map(compactPosition),
      toppings: toppings.map(compactTopping),
      createdAt: new Date().toISOString(),
    };

    try {
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, "cakes", id), payload);
      }
    } catch (err) {
      console.warn("Firebase cake save failed, using local fallback only:", err.message);
    }

    try {
      localStorage.setItem(`cake_share_${id}`, JSON.stringify(payload));
    } catch (err) {
      console.warn("Local cake save failed:", err.message);
    }

    const url = `${window.location.origin}/cake/${id}`;
    
    setShareUrl(url);
    setIsSaving(false);
    trackEv("cake_shared_paid", { provider });
    return true;
  }, [hasCakeData, shareUrl, name, flavor, tiers, age, note, candles, creamSwirls, toppings]);

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { setStatusMsg("Copy failed — try selecting the text manually."); }
  };

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
      trackEv("tip_attempt_cake", { provider: "razorpay", amount: currentTip.amount, currency });

      const orderRes = await fetch(apiUrl("/api/razorpay/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "tip",
          amountMinor,
          currency,
          receipt: `cake_${Date.now()}`,
          notes: { type: "cake_payment", amount: currentTip.amount },
        }),
      });
      const orderData = await readApi(orderRes);
      if (!orderRes.ok || !orderData?.orderId) {
        if (orderRes.status === 404) {
          throw new Error("Payment API endpoint not found (HTTP 404).");
        }
        const detail = orderData?.error || `HTTP ${orderRes.status}`;
        throw new Error(`Unable to create payment order (${detail}).`);
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        order_id: orderData.orderId,
        currency: orderData.currency || currency,
        name: "Petals and Words",
        description: "Unlock virtual cake share link",
        theme: { color: "#e91e63" },
        modal: {
          ondismiss: () => {
            setIsTipping(false);
            setTipMsg("Payment cancelled. Complete payment to unlock your share link.");
            trackEv("tip_cancelled_cake", { provider: "razorpay" });
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
            trackEv("tip_success_cake", { provider: "razorpay", amount: currentTip.amount });
          } catch {
            setTipDone(true);
            setTipMsg("Thank you! We received your payment.");
            trackEv("tip_success_cake", { provider: "razorpay", amount: currentTip.amount });
          }
          generateShareLink("razorpay").then(() => setIsTipping(false));
        },
      });

      razorpay.on("payment.failed", () => {
        setIsTipping(false);
        setTipMsg("Payment didn't go through. Please try again to get your share link.");
        trackEv("tip_failed_cake", { provider: "razorpay" });
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setTipMsg(err?.message || "Couldn't start payment. Please try again.");
      setIsTipping(false);
    }
  };

  if (!hasCakeData) {
    return (
      <main className="tip-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 100 }}>
          <LanguageSwitcher />
        </div>
        <div className="vv-card" style={{ maxWidth: 380, padding: "2rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎂</p>
          <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.4rem", fontWeight: 400, marginBottom: "0.5rem" }}>
            {t("paymentCake.noCakeFound", "No cake found")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#6b5e5f", marginBottom: "1.25rem" }}>
            {t("paymentCake.bakeFirst", "Bake your cake first, then come back to share it.")}
          </p>
          <Link to="/create-cake" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "linear-gradient(135deg, #e91e63, #f48fb1 160%)",
            color: "#fff", fontFamily: "'Manrope', sans-serif", fontWeight: 700,
            fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase",
            borderRadius: "9999px", padding: "0.75rem 1.75rem", textDecoration: "none",
            boxShadow: "0 12px 36px rgba(233,30,99,0.22)",
          }}>
            {t("paymentCake.createCake", "Create Cake")}
          </Link>
        </div>
      </main>
    );
  }

  if (isSaving) {
    return (
      <main className="tip-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <div className="vv-card" style={{ maxWidth: 380, padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, margin: "0 auto 1rem", border: "3px solid #f5f3ef", borderTop: "3px solid #e91e63", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.15rem", fontWeight: 400, color: "#3E2723" }}>
            {t("paymentCake.boxingUp", "Boxing up your cake...")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="tip-root" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <style>{CSS}</style>

      <header className="tip-header">
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/logo-transparent.png" alt="Petals and Words" style={{ height: 30, width: "auto" }} />
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <LanguageSwitcher />
            <Link to="/" className="vv-btn-ghost">{t("common.backHome", "Back Home")}</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>

        {tipDone ? (
          <>
            <div className="au au-1" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div className="check-pop" style={{
                width: 64, height: 64, borderRadius: "9999px", margin: "0 auto 1rem",
                background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.75rem",
                boxShadow: "0 8px 24px rgba(34,197,94,0.2)",
              }}>
                🎂
              </div>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.65rem", fontWeight: 400, lineHeight: 1.25, marginBottom: "0.4rem" }}>
                {t("paymentCake.yourCakeIs", "Your cake is")} <em style={{ color: "#e91e63" }}>{t("paymentCake.readyEm", "ready!")}</em>
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#6b5e5f" }}>
                {t("paymentCake.shareLinkBelow", "Share your birthday cake link below")}
              </p>
            </div>

            <div className="vv-card au au-2" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
              <p className="vv-label" style={{ marginBottom: "0.6rem" }}>{t("paymentCake.yourShareLink", "Your share link")}</p>
              <div className="share-url-box" style={{ marginBottom: "0.75rem" }}>{shareUrl}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={copyLink} className="share-btn" style={{
                  background: copied ? "#166534" : "#e91e63", color: "#fff"
                }}>
                  {copied ? t("paymentCake.copied", "Copied") : t("paymentCake.copyLink", "Copy link")}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `I made you a birthday cake! 🎂✨ Open it to blow out the candles and read your note:\n\n${shareUrl}`
                  )}`}
                  target="_blank" rel="noreferrer"
                  className="share-btn"
                  style={{ background: "#25D366", color: "#fff", textDecoration: "none" }}
                >
                  {t("paymentCake.whatsapp", "WhatsApp")}
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
              ✨
            </div>
            <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.65rem", fontWeight: 400, lineHeight: 1.25, marginBottom: "0.4rem" }}>
              {t("paymentCake.cakeIsBakedAnd", "Cake is baked and")} <em style={{ color: "#e91e63" }}>{t("paymentCake.readyEm", "ready!")}</em>
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#6b5e5f" }}>
              {t("paymentCake.completePaymentToGetLink", "Complete payment to get your share link")}
            </p>
          </div>
        )}

        {/* -- Preview -- */}
        <div className="vv-card au au-3" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              background: "#fce4ec", borderRadius: "0.875rem", padding: "0.6rem 0.75rem",
              display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56,
            }}>
              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🎂</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#e91e63", marginTop: "0.2rem" }}>{t("paymentCake.forName", "For {{name}}", { name })}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {note?.trim() ? (
                <>
                  <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "0.92rem", fontStyle: "italic", color: "#3E2723", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    "{note.trim().slice(0, 80)}{note.trim().length > 80 ? "..." : ""}"
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.25rem" }}>{t("paymentCake.wordsCount", "{{count}} words", { count: wordCount })}</p>
                </>
              ) : (
                <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "0.85rem", fontStyle: "italic", color: "#9e8f90" }}>
                  {t("paymentCake.sweetCakeFor", "A sweet cake for {{name}}", { name })}
                </p>
              )}
            </div>
          </div>
        </div>

        {!tipDone && !BYPASS_CAKE_PAYMENT_FOR_TESTING ? (
          <div className="vv-card au au-4" style={{ padding: "1.5rem 1.25rem", marginBottom: "1rem", textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2.2rem" }}>{t("payment.secure", "Secure")}</span>
            </div>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.25rem", fontWeight: 400, marginBottom: "0.3rem" }}>
              {t("payment.completePayment", "Complete Payment")}
            </h2>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.8rem" }}>
              <a href="https://razorpay.com/" target="_blank" rel="noreferrer">
                <img
                  referrerPolicy="origin"
                  src="https://badges.razorpay.com/badge-dark.png"
                  style={{ height: 45, width: 113 }}
                  alt="Razorpay | Payment Gateway"
                  loading="lazy"
                />
              </a>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#6b5e5f", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              {t("paymentCake.payTinyAmount", "Pay a tiny amount to get your unique share link.")}<br />
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {tipPresets.map((preset, i) => (
                <button
                  key={preset.display}
                  type="button"
                  className={`tip-btn ${selectedTip === i ? "selected" : ""}`}
                  onClick={() => setSelectedTip(i)}
                >
                  <span className="tip-emoji">{t(preset.labelKey, preset.fallback)}</span>
                  <span className="tip-amount">{preset.display}</span>
                </button>
              ))}
            </div>

            {isDetectingCountry ? (
              <p style={{ fontSize: "0.78rem", color: "#9e8f90" }}>{t("payment.loadingOptions", "Loading payment option...")}</p>
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
                    {t("payment.processing", "Processing payment...")}
                  </>
                ) : (
                  t("paymentCake.payAmountToGetLink", "Pay {{amount}} to get link", { amount: currentTip.display })
                )}
              </button>
            )}

            {tipMsg && (
              <p style={{ fontSize: "0.78rem", color: "#e91e63", marginTop: "0.75rem" }}>{tipMsg}</p>
            )}
          </div>
        ) : tipDone ? (
          <div className="vv-card thank-you-pop au au-4" style={{
            padding: "2rem 1.25rem", marginBottom: "1rem", textAlign: "center",
            background: "linear-gradient(135deg, #fdf4ff, #fce7f3, #fff1f2)",
          }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>{t("payment.thankYouEmoji", "🎉")}</span>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.35rem", fontWeight: 400, marginBottom: "0.3rem", color: "#e91e63" }}>
              {t("payment.thankYouSoMuch", "Thank you so much!")}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#6b5e5f", lineHeight: 1.6 }}>
              {t("paymentCake.enjoyCelebrating", "Enjoy celebrating their special day!")}
            </p>
          </div>
        ) : null}

        {statusMsg && (
          <div style={{
            borderRadius: "0.875rem", background: "#fef2f2", padding: "0.75rem 1rem",
            fontSize: "0.82rem", color: "#991b1b", marginBottom: "1rem",
          }}>
            {statusMsg}
          </div>
        )}

        <div className="au au-5" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
          <Link to="/create-cake" style={{ fontSize: "0.78rem", color: "#9e8f90", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            {t("paymentCake.createAnotherCake", "Create another cake")}
          </Link>
        </div>

      </div>
    </main>
  );
}
