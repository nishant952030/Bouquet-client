import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { trackEvent } from "../lib/analytics";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo } from "../lib/seo";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
function apiUrl(p) { const n = p.startsWith("/") ? p : `/${p}`; return `${API_BASE_URL}${n}`; }
async function readApi(r) {
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) { try { return await r.json(); } catch { return null; } }
  try { const t = await r.text(); return t ? { error: t } : null; } catch { return null; }
}
function getCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = String(navigator?.language || "").toUpperCase();
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || locale.includes("-IN")) return "IN";
    return "OTHER";
  } catch { return "IN"; }
}

const TIP_INR = [
  { label: "Basic", amount: 19, display: "₹19" },
  { label: "Popular", amount: 39, display: "₹39" },
  { label: "Supporter", amount: 59, display: "₹59" },
];
const TIP_USD = [
  { label: "Basic", amount: 0.99, display: "$0.99" },
  { label: "Popular", amount: 1.49, display: "$1.49" },
  { label: "Supporter", amount: 1.99, display: "$1.99" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Manrope:wght@400;500;600;700&family=Great+Vibes&display=swap');
  *,*::before,*::after{box-sizing:border-box}
  .pmc-root{font-family:'Manrope',sans-serif;min-height:100vh;background:linear-gradient(160deg,#fdf2f8,#fce7f3,#fbcfe8);color:#3E2723}
  .pmc-header{position:sticky;top:0;z-index:40;backdrop-filter:blur(18px);background:rgba(253,242,248,0.85);border-bottom:1px solid rgba(244,114,182,0.1)}
  .pmc-inner{max-width:440px;margin:0 auto;padding:1.25rem}
  .pmc-card{background:#fff;border-radius:1.25rem;box-shadow:0 6px 24px rgba(0,0,0,0.06);padding:1.25rem;margin-bottom:1rem}
  .pmc-label{font-size:0.7rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#be185d;margin-bottom:0.5rem;display:block}
  .pmc-ghost{display:inline-flex;align-items:center;gap:5px;background:none;color:#be185d;font-size:0.78rem;font-weight:600;border:1.5px solid rgba(190,50,90,0.25);border-radius:999px;padding:0.3rem 0.8rem;cursor:pointer;text-decoration:none;transition:all 0.15s}
  .pmc-ghost:hover{background:#fdf2f8;border-color:#ec4899}

  .pmc-tip-row{display:flex;gap:0.5rem;margin-bottom:1rem}
  .pmc-tip{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0.75rem 0.4rem;border-radius:1rem;border:2px solid transparent;background:#fdf2f8;cursor:pointer;transition:all 0.18s;font-family:'Manrope',sans-serif}
  .pmc-tip:hover{border-color:#f9a8d4}
  .pmc-tip.sel{border-color:#ec4899;background:#fce7f3}
  .pmc-tip-label{font-size:0.72rem;font-weight:600;color:#9d174d}
  .pmc-tip-amount{font-size:0.95rem;font-weight:700;color:#3E2723}

  .pmc-cta{width:100%;padding:0.85rem;border:none;border-radius:999px;background:linear-gradient(135deg,#be185d,#ec4899);color:#fff;font-family:'Manrope',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;box-shadow:0 8px 28px rgba(190,50,90,0.3);transition:all 0.2s}
  .pmc-cta:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 36px rgba(190,50,90,0.4)}
  .pmc-cta:disabled{background:#e4d0d5;color:#a0888d;cursor:not-allowed;box-shadow:none;transform:none}

  @keyframes pmc-spin{to{transform:rotate(360deg)}}
  .pmc-spinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;animation:pmc-spin 0.8s linear infinite;display:inline-block}

  .pmc-share-url{background:#fdf2f8;border-radius:0.75rem;padding:0.75rem;word-break:break-all;font-size:0.8rem;color:#9d174d;font-family:'Manrope',monospace;margin-bottom:0.6rem}
  .pmc-share-btns{display:flex;gap:0.5rem}
  .pmc-share-btn{flex:1;padding:0.65rem;border-radius:0.75rem;border:none;cursor:pointer;font-family:'Manrope',sans-serif;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.15s;text-decoration:none;color:#fff}
  .pmc-share-btn:active{transform:scale(0.97)}

  @keyframes pmc-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .pmc-fu{animation:pmc-fadeUp 0.4s ease forwards}
  .pmc-fu-1{animation-delay:0.05s;opacity:0}
  .pmc-fu-2{animation-delay:0.15s;opacity:0}
  .pmc-fu-3{animation-delay:0.25s;opacity:0}
`;

export default function PaymentCardMD() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const cardData = location.state?.cardData || (() => {
    try { return JSON.parse(localStorage.getItem("pw_pending_md_card")); } catch { return null; }
  })();

  const [countryCode, setCountryCode] = useState(getCountry);
  const [detecting, setDetecting] = useState(true);
  const [selectedTip, setSelectedTip] = useState(1);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isIndia = countryCode === "IN";
  const tips = isIndia ? TIP_INR : TIP_USD;
  const tip = tips[selectedTip];

  useEffect(() => {
    applySeo({ title: "Complete Payment | Mother's Day Card", path: "/payment-card-md", robots: "noindex,nofollow" });
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      setDetecting(true);
      try {
        const r = await fetch(apiUrl("/api/geo"));
        const d = await readApi(r);
        if (!c) setCountryCode(String(d?.country || "").toUpperCase() || getCountry());
      } catch { if (!c) setCountryCode(getCountry()); }
      finally { if (!c) setDetecting(false); }
    })();
    return () => { c = true; };
  }, []);

  const generateLink = useCallback(async () => {
    if (!cardData) return;
    const id = `mc_${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const payload = { ...cardData, type: "mothers_day_card", plan: "paid", createdAt: new Date().toISOString() };
    try {
      if (isFirebaseConfigured && db) await setDoc(doc(db, "cards", id), payload);
    } catch {}
    try { localStorage.setItem(`card_share_${id}`, JSON.stringify(payload)); } catch {}
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cardData))));
    const url = `${window.location.origin}/mothers-day?card=${encoded}`;
    setShareUrl(url);
    trackEvent("md_card_shared", { paper: cardData.paper });
  }, [cardData]);

  const startPayment = async () => {
    if (paying || !razorpayKey) { setErrMsg("Payment setup incomplete."); return; }
    setErrMsg("");
    setPaying(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) throw new Error("Could not load Razorpay.");
      const currency = isIndia ? "INR" : "USD";
      const amountMinor = Math.round(tip.amount * 100);
      const orderRes = await fetch(apiUrl("/api/razorpay/create-order"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "md_card", amountMinor, currency, receipt: `mc_${Date.now()}`, notes: { type: "mothers_day_card" } }),
      });
      const orderData = await readApi(orderRes);
      if (!orderRes.ok || !orderData?.orderId) throw new Error(orderData?.error || `HTTP ${orderRes.status}`);

      const rz = new window.Razorpay({
        key: razorpayKey, order_id: orderData.orderId, currency: orderData.currency || currency,
        name: "Petals and Words", description: "Mother's Day Card", theme: { color: "#be185d" },
        modal: { ondismiss: () => { setPaying(false); setErrMsg("Payment cancelled."); } },
        handler: async (resp) => {
          try {
            const v = await fetch(apiUrl("/api/razorpay/verify"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
            await readApi(v);
          } catch {}
          setPaid(true);
          await generateLink();
          setPaying(false);
          localStorage.removeItem("pw_pending_md_card");
          trackEvent("md_card_payment_success", { amount: tip.amount });
        },
      });
      rz.on("payment.failed", () => { setPaying(false); setErrMsg("Payment failed. Please try again."); });
      rz.open();
    } catch (e) { setErrMsg(e?.message || "Payment error."); setPaying(false); }
  };

  if (!cardData) {
    return (
      <main className="pmc-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
        <style>{CSS}</style>
        <div className="pmc-card" style={{ textAlign: "center", maxWidth: 360 }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💌</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>No card found</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b5e5f", marginBottom: "1rem" }}>Create your card first!</p>
          <Link to="/create-mothers-day-card" className="pmc-ghost">Create Card 💌</Link>
        </div>
      </main>
    );
  }

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <main className="pmc-root" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <style>{CSS}</style>
      <header className="pmc-header">
        <div style={{ maxWidth: 440, margin: "0 auto", padding: "0.7rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/logo-transparent.png" alt="Petals & Words" style={{ height: 28 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link to="/" className="pmc-ghost">🏠 Home</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="pmc-inner">
        {paid ? (
          <>
            {/* Success */}
            <div className="pmc-fu pmc-fu-1" style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 0.75rem", background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 6px 20px rgba(34,197,94,0.2)" }}>✓</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                Your card is <em style={{ color: "#be185d" }}>live!</em>
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#6b5e5f" }}>Share the link below with Mom 💕</p>
            </div>
            <div className="pmc-card pmc-fu pmc-fu-2">
              <span className="pmc-label">Your share link</span>
              <div className="pmc-share-url">{shareUrl}</div>
              <div className="pmc-share-btns">
                <button onClick={copyLink} className="pmc-share-btn" style={{ background: copied ? "#166534" : "#be185d" }}>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent("I made this for you 💌 " + shareUrl)}`} target="_blank" rel="noreferrer" className="pmc-share-btn" style={{ background: "#25D366" }}>
                  WhatsApp
                </a>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <Link to="/create-mothers-day-card" style={{ fontSize: "0.78rem", color: "#9d174d", textDecoration: "underline" }}>Create another card</Link>
            </div>
          </>
        ) : (
          <>
            {/* Payment */}
            <div className="pmc-fu pmc-fu-1" style={{ textAlign: "center", marginBottom: "1rem" }}>
              <p style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>🔒</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                Your card is <em style={{ color: "#be185d" }}>ready!</em>
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#6b5e5f" }}>Complete payment to get your share link</p>
            </div>

            {/* Card preview */}
            <div className="pmc-card pmc-fu pmc-fu-2" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "#fce7f3", borderRadius: "0.75rem", padding: "0.5rem 0.6rem", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 50 }}>
                <span style={{ fontSize: "1.3rem" }}>💌</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#be185d", marginTop: "0.15rem" }}>Card</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.88rem", fontStyle: "italic", color: "#3E2723", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  "{cardData.msg?.slice(0, 80)}{(cardData.msg?.length || 0) > 80 ? "..." : ""}"
                </p>
                <p style={{ fontSize: "0.68rem", color: "#9e8f90", marginTop: "0.2rem" }}>To: {cardData.to || "Mom"}</p>
              </div>
            </div>

            {/* Payment card */}
            <div className="pmc-card pmc-fu pmc-fu-3" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>🔒</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", fontWeight: 600, margin: "0.3rem 0" }}>Complete Payment</h2>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
                <a href="https://razorpay.com/" target="_blank" rel="noreferrer">
                  <img src="https://badges.razorpay.com/badge-dark.png" style={{ height: 40, width: 100 }} alt="Razorpay" loading="lazy" />
                </a>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#6b5e5f", marginBottom: "1rem", lineHeight: 1.5 }}>
                Pay a small amount to generate your unique share link.
              </p>

              <div className="pmc-tip-row">
                {tips.map((t, i) => (
                  <button key={t.display} type="button" className={`pmc-tip ${selectedTip === i ? "sel" : ""}`} onClick={() => setSelectedTip(i)}>
                    <span className="pmc-tip-label">{t.label}</span>
                    <span className="pmc-tip-amount">{t.display}</span>
                  </button>
                ))}
              </div>

              {detecting ? (
                <p style={{ fontSize: "0.78rem", color: "#9e8f90" }}>Loading payment...</p>
              ) : (
                <button type="button" className="pmc-cta" onClick={startPayment} disabled={paying}>
                  {paying ? <><span className="pmc-spinner" /> Processing...</> : `Pay ${tip.display} to get link`}
                </button>
              )}

              {errMsg && <p style={{ fontSize: "0.78rem", color: "#be185d", marginTop: "0.6rem" }}>{errMsg}</p>}
              <p style={{ fontSize: "0.68rem", color: "#c4b5b6", marginTop: "0.6rem" }}>
                {isIndia ? "Card, UPI, wallets via Razorpay" : "International cards via Razorpay (USD)"}
              </p>
            </div>

            <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
              <Link to="/create-mothers-day-card" style={{ fontSize: "0.78rem", color: "#9d174d", textDecoration: "underline" }}>← Back to editor</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
