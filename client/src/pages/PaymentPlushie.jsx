import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
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
  { label: "Basic", amount: 29, display: "₹29" },
  { label: "Please", amount: 59, display: "₹59" },
  { label: "Please Please", amount: 69, display: "₹69" },
];
const TIP_USD = [
  { label: "Basic", amount: 1.99, display: "$1.99" },
  { label: "Please", amount: 2.99, display: "$2.99" },
  { label: "Please Please", amount: 3.99, display: "$3.99" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Manrope:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box}
  .pp-root{font-family:'Manrope',sans-serif;min-height:100vh;background:linear-gradient(160deg,#fff5f6,#fce7f3,#e0e7ff);color:#3E2723}
  .pp-header{position:sticky;top:0;z-index:40;backdrop-filter:blur(18px);background:rgba(255,245,246,0.85);border-bottom:1px solid rgba(244,114,182,0.1)}
  .pp-inner{max-width:440px;margin:0 auto;padding:1.25rem}
  .pp-card{background:#fff;border-radius:1.25rem;box-shadow:0 6px 24px rgba(0,0,0,0.06);padding:1.25rem;margin-bottom:1rem}
  .pp-label{font-size:0.7rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#be185d;margin-bottom:0.5rem;display:block}
  .pp-ghost{display:inline-flex;align-items:center;gap:5px;background:none;color:#be185d;font-size:0.78rem;font-weight:600;border:1.5px solid rgba(190,50,90,0.25);border-radius:999px;padding:0.3rem 0.8rem;cursor:pointer;text-decoration:none;transition:all 0.15s}
  .pp-ghost:hover{background:#fff5f6;border-color:#ec4899}

  .pp-tip-row{display:flex;gap:0.5rem;margin-bottom:1rem}
  .pp-tip{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:0.75rem 0.4rem;border-radius:1rem;border:2px solid transparent;background:#fff5f6;cursor:pointer;transition:all 0.18s}
  .pp-tip:hover{border-color:#f9a8d4}
  .pp-tip.sel{border-color:#ec4899;background:#fce7f3}
  .pp-tip-label{font-size:0.72rem;font-weight:600;color:#9d174d}
  .pp-tip-amount{font-size:0.95rem;font-weight:700;color:#3E2723}

  .pp-cta{width:100%;padding:0.85rem;border:none;border-radius:999px;background:linear-gradient(135deg,#be185d,#ec4899);color:#fff;font-family:'Manrope',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;box-shadow:0 8px 28px rgba(190,50,90,0.3);transition:all 0.2s}
  .pp-cta:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 36px rgba(190,50,90,0.4)}
  .pp-cta:disabled{background:#e4d0d5;color:#a0888d;cursor:not-allowed;box-shadow:none;transform:none}

  @keyframes pp-spin{to{transform:rotate(360deg)}}
  .pp-spinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;animation:pp-spin 0.8s linear infinite;display:inline-block}

  .pp-share-url{background:#fff5f6;border-radius:0.75rem;padding:0.75rem;word-break:break-all;font-size:0.8rem;color:#9d174d;font-family:'Manrope',monospace;margin-bottom:0.6rem}
  .pp-share-btns{display:flex;gap:0.5rem}
  .pp-share-btn{flex:1;padding:0.65rem;border-radius:0.75rem;border:none;cursor:pointer;font-family:'Manrope',sans-serif;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.15s;text-decoration:none;color:#fff}
  .pp-share-btn:active{transform:scale(0.97)}

  @keyframes pp-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .pp-fu{animation:pp-fadeUp 0.4s ease forwards}
  .pp-fu-1{animation-delay:0.05s;opacity:0}
  .pp-fu-2{animation-delay:0.15s;opacity:0}
  .pp-fu-3{animation-delay:0.25s;opacity:0}
`;

export default function PaymentPlushie() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const plushieData = location.state?.plushieData || (() => {
    try { return JSON.parse(localStorage.getItem("pw_pending_plushie")); } catch { return null; }
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
    applySeo({ title: "Complete Payment | Plushie Box", path: "/payment-plushie", robots: "noindex,nofollow" });
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
    if (!plushieData) return;
    const id = `pl_${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const payload = { ...plushieData, type: "plushie", plan: "paid", createdAt: new Date().toISOString() };
    
    // Save to Firebase
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, "plushies", id), payload).catch((err) => {
        console.warn("Firebase plushie save failed:", err.message);
      });
    }

    try { localStorage.setItem(`plushie_share_${id}`, JSON.stringify(payload)); } catch {}

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(plushieData))));
    const url = `${window.location.origin}/plushie/${id}?data=${encodeURIComponent(encoded)}`;
    setShareUrl(url);
    trackEvent("plushie_shared", { plushieType: plushieData.plushieType, accessory: plushieData.accessory });
  }, [plushieData]);

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
        body: JSON.stringify({ planId: "plushie", amountMinor, currency, receipt: `pl_${Date.now()}`, notes: { type: "plushie" } }),
      });
      const orderData = await readApi(orderRes);
      if (!orderRes.ok || !orderData?.orderId) throw new Error(orderData?.error || `HTTP ${orderRes.status}`);

      const rz = new window.Razorpay({
        key: razorpayKey, order_id: orderData.orderId, currency: orderData.currency || currency,
        name: "Petals and Words", description: "Plushie Box Gift", theme: { color: "#be185d" },
        modal: { ondismiss: () => { setPaying(false); setErrMsg("Payment cancelled."); } },
        handler: async (resp) => {
          try {
            const v = await fetch(apiUrl("/api/razorpay/verify"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
            await readApi(v);
          } catch {}
          setPaid(true);
          await generateLink();
          setPaying(false);
          localStorage.removeItem("pw_pending_plushie");
          try {
            localStorage.setItem("pw_has_paid", "true");
            window.dispatchEvent(new CustomEvent("pw-payment-success"));
          } catch (e) {}
          trackEvent("plushie_payment_success", { amount: tip.amount });
        },
      });
      rz.on("payment.failed", () => { setPaying(false); setErrMsg("Payment failed. Please try again."); });
      rz.open();
    } catch (e) { setErrMsg(e?.message || "Payment error."); setPaying(false); }
  };

  if (!plushieData) {
    return (
      <main className="pp-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
        <style>{CSS}</style>
        <div className="pp-card" style={{ textAlign: "center", maxWidth: 360 }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧸</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>No plushie found</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b5e5f", marginBottom: "1rem" }}>Create your plushie first!</p>
          <Link to="/create-plushie" className="pp-ghost">Create Plushie 🧸</Link>
        </div>
      </main>
    );
  }

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const displayName = plushieData.plushieType === "bear" ? "Teddy Bear" : plushieData.plushieType === "bunny" ? "Bunny" : "Panda";

  return (
    <main className="pp-root" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <style>{CSS}</style>
      <header className="pp-header">
        <div style={{ maxWidth: 440, margin: "0 auto", padding: "0.7rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/logo-transparent.png" alt="Petals & Words" style={{ height: 28 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link to="/" className="pp-ghost">🏠 Home</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="pp-inner">
        {paid ? (
          <>
            {/* Success */}
            <div className="pp-fu pp-fu-1" style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 0.75rem", background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 6px 20px rgba(34,197,94,0.2)" }}>✓</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                Your plushie is <em style={{ color: "#be185d" }}>ready!</em>
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#6b5e5f" }}>Share the link below with your loved one 💕</p>
            </div>
            <div className="pp-card pp-fu pp-fu-2">
              <span className="pp-label">Your share link</span>
              <div className="pp-share-url">{shareUrl}</div>
              <div className="pp-share-btns">
                <button onClick={copyLink} className="pp-share-btn" style={{ background: copied ? "#166534" : "#be185d" }}>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent("I wrapped a cute surprise for you! 🧸 " + shareUrl)}`} target="_blank" rel="noreferrer" className="pp-share-btn" style={{ background: "#25D366" }}>
                  WhatsApp
                </a>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <Link to="/create-plushie" style={{ fontSize: "0.78rem", color: "#9d174d", textDecoration: "underline" }}>Create another plushie</Link>
            </div>
          </>
        ) : (
          <>
            {/* Payment */}
            <div className="pp-fu pp-fu-1" style={{ textAlign: "center", marginBottom: "1rem" }}>
              <p style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>🎁</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                Your box is <em style={{ color: "#be185d" }}>wrapped!</em>
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#6b5e5f" }}>Complete payment to get your share link</p>
            </div>

            {/* Preview detail */}
            <div className="pp-card pp-fu pp-fu-2" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "#fee2e2", borderRadius: "0.75rem", padding: "0.5rem 0.6rem", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 50 }}>
                <span style={{ fontSize: "1.3rem" }}>🧸</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#be185d", marginTop: "0.15rem" }}>Gift</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.88rem", fontStyle: "italic", color: "#3E2723", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  "{plushieData.msg?.slice(0, 80)}{(plushieData.msg?.length || 0) > 80 ? "..." : ""}"
                </p>
                <p style={{ fontSize: "0.68rem", color: "#9e8f90", marginTop: "0.2rem" }}>Type: {displayName} (Accessory: {plushieData.accessory})</p>
              </div>
            </div>

            {/* Payment card */}
            <div className="pp-card pp-fu pp-fu-3" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>🔒</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", fontWeight: 600, margin: "0.3rem 0" }}>Complete Payment</h2>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
                <a href="https://razorpay.com/" target="_blank" rel="noreferrer">
                  <img src="https://badges.razorpay.com/badge-dark.png" style={{ height: 40, width: 100 }} alt="Razorpay logo" loading="lazy" />
                </a>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#6b5e5f", marginBottom: "1rem", lineHeight: 1.5 }}>
                Pay a small amount to generate your unique share link.
              </p>

              <div className="pp-tip-row">
                {tips.map((t, i) => (
                  <button key={t.display} type="button" className={`pp-tip ${selectedTip === i ? "sel" : ""}`} onClick={() => setSelectedTip(i)}>
                    <span className="pp-tip-label">{t.label}</span>
                    <span className="pp-tip-amount">{t.display}</span>
                  </button>
                ))}
              </div>

              {detecting ? (
                <p style={{ fontSize: "0.78rem", color: "#9e8f90" }}>Loading payment...</p>
              ) : (
                <button type="button" className="pp-cta" onClick={startPayment} disabled={paying}>
                  {paying ? <><span className="pp-spinner" /> Processing...</> : `Pay ${tip.display} to get link`}
                </button>
              )}

              {errMsg && <p style={{ fontSize: "0.78rem", color: "#be185d", marginTop: "0.6rem" }}>{errMsg}</p>}
              <p style={{ fontSize: "0.68rem", color: "#c4b5b6", marginTop: "0.6rem" }}>
                {isIndia ? "Card, UPI, wallets via Razorpay" : "International cards via Razorpay (USD)"}
              </p>
            </div>

            <div style={{ textAlign: "center", marginTop: "0.25rem" }}>
              <Link to="/create-plushie" style={{ fontSize: "0.78rem", color: "#9d174d", textDecoration: "underline" }}>← Back to editor</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
