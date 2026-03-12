import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { trackEvent } from "../lib/analytics";
import {
  formatUsdFromCents,
  getOfferDateLabel,
  getSmallPlanUsdCents,
  getUnlimitedPlanUsdCents,
  isLaunchOfferActive,
} from "../lib/pricing";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";
import { clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft } from "../lib/checkoutStorage";

/*  Women's Day expiry 
   All WD UI disappears automatically at midnight March 8.
 */
function isWomensDay() {
  const n = new Date();
  return n.getMonth() === 2 && n.getDate() === 8;
}
function msUntilMidnight() {
  const n = new Date(), m = new Date(n);
  m.setHours(24, 0, 0, 0);
  return m.getTime() - n.getTime();
}

/*  constants  */
const PENDING_KEY = "pw_pending_global_checkout";

/*  helpers  */
function countWords(text) {
  const n = String(text || "").trim();
  return n ? n.split(/\s+/).length : 0;
}
function getRequiredPlan(fc, wc) {
  return fc <= 5 && wc <= 60 ? "small" : "medium";
}
function trackEv(name, payload) {
  track(name, payload);
  trackEvent(name, payload);
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

/*  SVG Doodles  */
function DoodleFlower({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M40 40C40 40 36 28 40 22C44 28 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 52 36 58 40C52 44 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 44 52 40 58C36 52 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 28 44 22 40C28 36 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 30 30 29 24C35 27 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M40 40C40 40 50 50 51 56C45 53 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="4" fill="#f7d6d0" stroke="#c0605a" strokeWidth="1.5" />
    </svg>
  );
}
function DoodleHeart({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 50 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M25 42C25 42 4 28 4 15C4 8 9 3 16 4C20 4.5 23 7 25 10C27 7 30 4.5 34 4C41 3 46 8 46 15C46 28 25 42 25 42Z" stroke="#c0605a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12C13 12 11 14 11 17" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function DoodleSparkle({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M15 2L15 28M2 15L28 15" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 6L24 24M24 6L6 24" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function DoodleStar({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M20 4L21.8 15.5L33 12L24.5 20L33 28L21.8 24.5L20 36L18.2 24.5L7 28L15.5 20L7 12L18.2 15.5Z" stroke="#c8a96e" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function DoodleLeaf({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M25 55C25 55 8 40 10 20C15 8 25 5 25 5C25 5 35 8 40 20C42 40 25 55 25 55Z" stroke="#7a9e72" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 55L25 10M25 38C20 34 14 32 12 28M25 38C30 34 36 32 38 28" stroke="#7a9e72" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function DoodleWreathLeft({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 60 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M30 190C28 160 32 130 26 100C22 75 28 50 24 20" stroke="#7a9e72" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 160C18 152 10 148 8 140C16 138 24 144 26 160Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M28 130C36 120 44 118 48 110C40 108 32 116 28 130Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M26 100C16 94 8 88 6 78C14 78 22 86 26 100Z" stroke="#7a9e72" strokeWidth="1.2" />
      <circle cx="24" cy="40" r="5" stroke="#c0605a" strokeWidth="1.5" />
      <path d="M24 35L24 28M29 40L36 40M24 45L24 52M19 40L12 40" stroke="#c0605a" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function DoodleWreathRight({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 60 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M30 190C32 160 28 130 34 100C38 75 32 50 36 20" stroke="#7a9e72" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 160C42 152 50 148 52 140C44 138 36 144 34 160Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M32 130C24 120 16 118 12 110C20 108 28 116 32 130Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M34 100C44 94 52 88 54 78C46 78 38 86 34 100Z" stroke="#7a9e72" strokeWidth="1.2" />
      <circle cx="36" cy="40" r="5" stroke="#c0605a" strokeWidth="1.5" />
      <path d="M36 35L36 28M41 40L48 40M36 45L36 52M31 40L24 40" stroke="#c0605a" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/*  Countdown  */
function MidnightCountdown({ dark = false }) {
  const [ms, setMs] = useState(msUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const boxCls = dark
    ? "flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-white/20 px-1 text-[13px] font-bold text-white tabular-nums"
    : "flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-rose-100 px-1 text-[13px] font-bold text-rose-800 tabular-nums";
  const sepCls = dark ? "text-rose-300 text-[12px]" : "text-rose-400 text-[12px]";
  return (
    <div className="flex items-center gap-0.5 font-mono">
      {[h, m, s].map((unit, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <span className={boxCls}>{unit}</span>
          {i < 2 && <span className={sepCls}>:</span>}
        </span>
      ))}
    </div>
  );
}

/*  CSS  */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

  .pay-root {
    font-family: 'Jost', sans-serif;
    min-height: 100vh;
    background: linear-gradient(160deg,#fdf6f0 0%,#fceef0 50%,#fdf8f0 100%);
  }

  /* Subtle grain */
  .pay-root::before {
    content:'';
    position:fixed;
    inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
    pointer-events:none;
    z-index:0;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .au   { animation:fadeUp .45s ease forwards; }
  .au-1 { animation-delay:.05s; opacity:0; }
  .au-2 { animation-delay:.15s; opacity:0; }
  .au-3 { animation-delay:.25s; opacity:0; }
  .au-4 { animation-delay:.35s; opacity:0; }
  .au-5 { animation-delay:.45s; opacity:0; }
  .au-6 { animation-delay:.55s; opacity:0; }

  @keyframes floatUp {
    0%,100% { transform:translateY(0) rotate(0deg); opacity:.55; }
    50%      { transform:translateY(-14px) rotate(5deg); opacity:.85; }
  }
  .fp1 { animation:floatUp 4s ease-in-out infinite; }
  .fp2 { animation:floatUp 5.5s ease-in-out infinite 1.2s; }
  .fp3 { animation:floatUp 3.8s ease-in-out infinite .6s; }

  @keyframes ctaPulse {
    0%,100% { box-shadow:0 0 0 0 rgba(192,96,90,.4); }
    50%      { box-shadow:0 0 0 10px rgba(192,96,90,0); }
  }
  .cta-glow { animation:ctaPulse 2.4s ease-in-out infinite; }

  @keyframes shimmerGrad {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  .wd-shimmer {
    background:linear-gradient(90deg,#c0605a 0%,#e8a9a4 40%,#c8a96e 70%,#c0605a 100%);
    background-size:200% auto;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shimmerGrad 4s linear infinite;
  }

  @keyframes shimmerLoad {
    0%   { background-position:-200% 0; }
    100% { background-position:200% 0; }
  }
  .shimmer-loading {
    background:linear-gradient(90deg,#f0e4d8 25%,#faf6f0 50%,#f0e4d8 75%);
    background-size:200% 100%;
    animation:shimmerLoad 1.4s infinite;
  }

  @keyframes checkPop {
    0%  { transform:scale(0) rotate(-10deg); opacity:0; }
    70% { transform:scale(1.2) rotate(4deg);  opacity:1; }
    100%{ transform:scale(1) rotate(0deg);    opacity:1; }
  }
  .check-pop { animation:checkPop .5s cubic-bezier(.34,1.56,.64,1) forwards; }

  @keyframes blink {
    0%,100% { opacity:1; }
    50%     { opacity:.4; }
  }
  .blink-dot { animation:blink 1.6s ease-in-out infinite; }

  @keyframes tickerMove {
    0%   { transform:translateX(0); }
    100% { transform:translateX(-50%); }
  }
  .ticker-track { animation:tickerMove 22s linear infinite; }

  /* Plan cards */
  .plan-card {
    border-radius:16px;
    border:2px solid transparent;
    background:#faf6f0;
    padding:14px 16px;
    cursor:pointer;
    transition:all .18s ease;
    width:100%;
    text-align:left;
  }
  .plan-card.selected { border-color:#c0605a; background:#fff5f4; }
  .plan-card:not(.selected):hover { border-color:#e8a9a4; background:white; }
  .plan-radio {
    width:18px; height:18px;
    border-radius:50%;
    border:2px solid #d0c4bc;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; transition:all .15s;
  }
  .plan-card.selected .plan-radio { border-color:#c0605a; background:#c0605a; }
  .plan-radio::after {
    content:''; width:6px; height:6px;
    border-radius:50%; background:white; display:none;
  }
  .plan-card.selected .plan-radio::after { display:block; }

  /* Pay CTA */
  .pay-cta {
    width:100%; min-height:56px;
    border-radius:18px;
    background:#3a3028; color:#faf6f0;
    border:none;
    font-family:'Jost',sans-serif;
    font-size:15px; font-weight:600; letter-spacing:.08em;
    cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition:all .22s ease;
  }
  .pay-cta:hover:not(:disabled) {
    background:#8e3e3a;
    transform:translateY(-2px);
    box-shadow:0 12px 32px rgba(142,62,58,.3);
  }
  .pay-cta:active:not(:disabled) { transform:translateY(0) scale(.98); }
  .pay-cta:disabled { background:#e2d8d0; color:#b5a89e; cursor:not-allowed; }

  /* Success */
  .success-card {
    border-radius:20px;
    background:linear-gradient(135deg,#f0fdf4,#dcfce7);
    border:1.5px solid #86efac;
    padding:24px 20px;
  }
  .share-url-box {
    background:white; border:1.5px solid #86efac;
    border-radius:12px; padding:12px 16px;
    word-break:break-all; font-size:13px;
    color:#166534; line-height:1.5;
    font-family:'Jost',monospace;
  }

  .trust-pill {
    display:flex; align-items:center; gap:5px;
    font-size:11px; color:#7a6e65; font-weight:500;
  }
  .trust-pill-icon {
    width:20px; height:20px; border-radius:50%;
    background:white; border:1px solid #e8d5cd;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; flex-shrink:0;
  }
`;

/*  Sub-components  */
function TrustBar() {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-2">
      {[
        { icon: "", label: "256-bit SSL" },
        { icon: "", label: "Instant link" },
        { icon: "", label: "UPI  Cards  Wallets" },
        { icon: "", label: "10,000+ bouquets sent" },
      ].map((item) => (
        <div key={item.label} className="trust-pill">
          <div className="trust-pill-icon">{item.icon}</div>
          {item.label}
        </div>
      ))}
    </div>
  );
}

function SocialProofTicker({ wdActive }) {
  const general = [
    "Arjun from Bengaluru just sent a bouquet ",
    "Neha from Delhi sent one 2 min ago ",
    "Rahul from Pune just paid  link shared ",
    "Aditi from Mumbai loved her bouquet ",
  ];
  const wd = [
    "Priya from Hyderabad sent her mom a bouquet ",
    "Meera from Chennai just paid  Women's Day ",
    "Anjali from Delhi sent it 3 min ago ",
    "Kavya from Bengaluru's mom called immediately ",
    "Shruti from Pune  her best friend loved it ",
  ];
  const proofs = wdActive ? wd : general;
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % proofs.length); setVis(true); }, 300);
    }, 3500);
    return () => clearInterval(id);
  }, [proofs.length]);
  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
      <span className="blink-dot h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      <p className="text-[12px] text-emerald-800 transition-opacity duration-300" style={{ opacity: vis ? 1 : 0 }}>
        {proofs[idx]}
      </p>
    </div>
  );
}

function BouquetPreview({ flowerCount, wordCount, note, wdActive }) {
  const preview = note?.trim().slice(0, 65);
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-4" style={{ position: "relative" }}>
      {wdActive && <DoodleHeart className="absolute right-3 top-3 h-6 w-6 opacity-30" />}
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
        {wdActive ? "Her bouquet" : "Your bouquet"}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-100 bg-[#faf6f0] px-3 py-2.5 min-w-[60px]">
          <span className="text-2xl leading-none"></span>
          <span className="mt-1 text-[11px] font-semibold text-stone-700">{flowerCount} stems</span>
        </div>
        <div className="flex-1 min-w-0">
          {preview ? (
            <>
              <p className="text-[15px] italic leading-relaxed text-stone-700 line-clamp-2"
                style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                "{preview}{note.trim().length > 65 ? "" : ""}"
              </p>
              <p className="mt-1 text-[11px] text-stone-400">{wordCount} words in your note</p>
            </>
          ) : (
            <p className="text-[13px] italic text-stone-400" style={{ fontFamily: '"Cormorant Garamond",serif' }}>
              {wdActive ? "No note yet  she'll still love the flowers " : "No note added  bouquet only"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* 
   MAIN COMPONENT
 */
export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const offerActive = isLaunchOfferActive();

  const wdActive = false;

  const pendingCheckout = useMemo(() => getPending(), []);
  const checkoutDraft = useMemo(() => loadCheckoutDraft(), []);
  const stems = location.state?.stems ?? pendingCheckout?.stems ?? checkoutDraft?.stems ?? [];
  const note = location.state?.note ?? pendingCheckout?.note ?? checkoutDraft?.note ?? "";
  const initName = location.state?.senderName ?? pendingCheckout?.senderName ?? checkoutDraft?.senderName ?? "";

  const hasBouquetData = stems.length > 0 || countWords(note) > 0;
  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const requiredPlanId = useMemo(() => getRequiredPlan(flowerCount, wordCount), [flowerCount, wordCount]);

  const [selectedPlanId, setSelectedPlanId] = useState(requiredPlanId);
  const [senderName, setSenderName] = useState(initName);
  const [checkoutMsg, setCheckoutMsg] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const [fbName, setFbName] = useState("");
  const [fbMsg, setFbMsg] = useState("");
  const [fbStatus, setFbStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@petalsandwords.com";
  const isIndiaUser = true;
  const paymentProvider = "razorpay";
  const isDetectingCountry = false;
  const isVerifyingStripeReturn = false;

  const plans = useMemo(() => ([
    {
      id: "small",
      label: "Small",
      sublabel: "Up to 5 flowers  60 words",
      emoji: "",
      amountCents: getSmallPlanUsdCents(),
      originalCents: null,
      badge: null,
    },
    {
      id: "medium",
      label: "Unlimited",
      sublabel: "Unlimited flowers & words",
      emoji: "",
      amountCents: getUnlimitedPlanUsdCents(),
      originalCents: null,
      badge: "Most popular",
    },
  ]), []);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) ?? plans[0];
  const canKeepEverything = selectedPlanId === "medium" || requiredPlanId === "small";
  const displayPlanAmount = formatUsdFromCents(selectedPlan.amountCents);
  const selectedPlanAmountMinor = selectedPlan.amountCents;

  /* effects */
  useEffect(() => {
    applySeo({
      title: "Checkout  Petals and Words",
      description: "Complete bouquet checkout and get your share link instantly.",
      keywords: seoKeywords.payment,
      path: "/payment",
      robots: "noindex,nofollow",
    });
  }, []);

  useEffect(() => {
    trackEv("checkout_page_view", { flowerCount, wordCount, requiredPlanId, paymentProvider });
  }, [flowerCount, wordCount, requiredPlanId, paymentProvider]);

  useEffect(() => {
    if (!hasBouquetData) return;
    saveCheckoutDraft({ stems, note, senderName });
  }, [hasBouquetData, note, senderName, stems]);

  useEffect(() => {
    if (hasPaid) return;
    window.history.pushState(null, "", window.location.href);
    const onPop = () => {
      if (window.confirm("Are you sure you want to leave checkout?")) {
        window.removeEventListener("popstate", onPop);
        navigate(-1);
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [hasPaid, navigate]);

  /* payment */
  const createShareLink = async (meta = null) => {
    const id = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const payload = { stems, note, plan: selectedPlanId, senderName: senderName.trim(), payment: meta, createdAt: new Date().toISOString() };
    try {
      if (isFirebaseConfigured && db) await setDoc(doc(db, "bouquets", id), payload);
      localStorage.setItem(`bouquet_share_${id}`, JSON.stringify(payload));
      localStorage.removeItem(PENDING_KEY);
      clearCheckoutDraft();
    } catch (err) {
      console.error(err);
      setCheckoutMsg("Payment captured, but link save failed. Contact support.");
      return false;
    }
    const url = `${window.location.origin}/view/${id}`;
    setShareUrl(url);
    setHasPaid(true);
    setCheckoutMsg("Payment successful. Share link ready.");
    trackEv("payment_success", { selectedPlanId, provider: paymentProvider });
    return true;
  };

  const startRazorpay = async () => {
    if (!razorpayKeyId) { setCheckoutMsg("Payment is not configured."); return; }
    const ready = await loadRazorpayScript();
    if (!ready || !window.Razorpay) { setCheckoutMsg("Unable to load payment gateway."); return; }
    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise: selectedPlanAmountMinor, currency: "USD", notes: { selectedPlanId, flowers: String(flowerCount), words: String(wordCount) } }),
    });
    const orderData = await readApi(orderRes);
    if (!orderRes.ok || !orderData?.orderId) throw new Error(orderData?.error || "Unable to create payment order.");
    const options = {
      key: razorpayKeyId,
      amount: orderData.amount, currency: orderData.currency, order_id: orderData.orderId,
      name: "Petals and Words",
      description: `${selectedPlan.label} plan  ${wdActive ? "Women's Day" : "Bouquet"}`,
      prefill: { name: senderName.trim() || "Someone special" },
      notes: { selectedPlanId },
      theme: { color: "#c0605a" },
      handler: async (response) => {
        try {
          const vRes = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(response) });
          const vData = await readApi(vRes);
          if (!vRes.ok || !vData?.ok) throw new Error(vData?.error || "Verification failed");
          await createShareLink({ provider: "razorpay", razorpay_order_id: response?.razorpay_order_id || "", razorpay_payment_id: response?.razorpay_payment_id || "" });
        } catch (err) {
          console.error(err);
          setCheckoutMsg("Payment received but verification failed. Contact support.");
        } finally { setIsPaying(false); }
      },
      modal: {
        ondismiss: () => {
          setIsPaying(false);
          setCheckoutMsg("Payment cancelled. Tap Pay again when ready.");
          trackEv("payment_drop", { provider: "razorpay" });
        },
      },
    };
    const rz = new window.Razorpay(options);
    rz.on("payment.failed", (r) => {
      setCheckoutMsg("Payment did not complete. Try again.");
      setIsPaying(false);
      trackEv("payment_failed", { provider: "razorpay", code: r?.error?.code || "unknown" });
    });
    rz.open();
  };

  const completeCheckout = async () => {
    if (!canKeepEverything || isPaying) return;
    setCheckoutMsg(""); setIsPaying(true);
    trackEv("payment_attempt", { selectedPlanId, provider: paymentProvider, amount: selectedPlanAmountMinor });
    try { await startRazorpay(); }
    catch (err) { console.error(err); setCheckoutMsg(err?.message || "Unable to start payment."); setIsPaying(false); }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true); setCheckoutMsg("Link copied!");
      setTimeout(() => setCopied(false), 2200);
    } catch { setCheckoutMsg("Copy failed. Copy manually."); }
  };

  const sendFeedback = (e) => {
    e.preventDefault();
    if (!fbMsg.trim()) { setFbStatus("Please add feedback first."); return; }
    const sub = encodeURIComponent("Post-purchase feedback - Petals and Words");
    const body = encodeURIComponent(`Name: ${fbName.trim() || "Anonymous"}\nPlan: ${selectedPlanId}\n\nFeedback:\n${fbMsg}`);
    window.location.href = `mailto:${supportEmail}?subject=${sub}&body=${body}`;
    setFbStatus(`Thanks! Draft opened for ${supportEmail}.`);
  };

  const isCtaDisabled = !canKeepEverything || isPaying || isDetectingCountry || isVerifyingStripeReturn;

  /*  No bouquet  */
  if (!hasBouquetData) {
    return (
      <main className="pay-root flex min-h-screen items-center justify-center px-4 py-8">
        <style>{CSS}</style>
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-xl">
          {wdActive && <DoodleFlower className="absolute -right-2 -top-2 h-14 w-14 fp2 opacity-20" />}
          <p className="mb-3 text-4xl"></p>
          <h1 className="text-xl font-light text-stone-800" style={{ fontFamily: '"Cormorant Garamond",serif' }}>
            No bouquet found
          </h1>
          <p className="mt-2 text-sm text-stone-500">Create your bouquet first, then come back to pay.</p>
          <Link to="/create"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3a3028] px-6 py-3 text-sm font-semibold text-[#faf6f0] shadow-md hover:bg-[#8e3e3a] transition-all">
            {wdActive ? "Create her bouquet " : "Create bouquet "}
          </Link>
        </div>
      </main>
    );
  }

  /*  Success state  */
  if (hasPaid && shareUrl) {
    return (
      <main className="pay-root min-h-screen px-4 pb-16 pt-8">
        <style>{CSS}</style>

        {/* bg doodles WD */}
        {wdActive && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
            <DoodleFlower className="absolute right-4 top-10 h-14 w-14 fp2 opacity-15" />
            <DoodleSparkle className="absolute left-6 top-20 h-8 w-8 fp3 opacity-20" />
          </div>
        )}

        <div className="mx-auto max-w-sm">
          <div className="au au-1 mb-5 text-center">
            <div className="check-pop mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-50 text-3xl shadow-lg">
              
            </div>
            <h1 className="text-2xl font-light text-stone-800" style={{ fontFamily: '"Cormorant Garamond",serif' }}>
              {wdActive ? "Her bouquet is ready! " : "Payment successful!"}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {wdActive
                ? "Share the link and make her Women's Day unforgettable."
                : "Your bouquet is live. Share the link below."}
            </p>
          </div>

          <div className="success-card au au-2 mb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Your share link</p>
            <div className="share-url-box mb-3">{shareUrl}</div>
            <div className="flex gap-2">
              <button onClick={copyLink}
                className={["flex-1 rounded-xl py-3 text-[13px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-95",
                  copied ? "bg-emerald-700 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700"].join(" ")}>
                {copied ? " Copied!" : "Copy link"}
              </button>
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                wdActive
                  ? `Happy Women's Day!  Here's a special bouquet I made for you  ${shareUrl}`
                  : `Here's a bouquet I made for you  ${shareUrl}`
              )}`} target="_blank" rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-[#1da851] active:scale-95">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L.057 23.272a.75.75 0 00.914.914l5.427-1.47A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-5.2-1.501l-.373-.221-3.87 1.048 1.048-3.834-.241-.385A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Feedback */}
          <div className="au au-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Quick feedback</p>
            <input type="text" value={fbName} onChange={e => setFbName(e.target.value)}
              placeholder="Your name (optional)"
              className="mb-2 w-full rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            <textarea rows={3} value={fbMsg} onChange={e => setFbMsg(e.target.value)}
              placeholder={wdActive ? "How was the Women's Day experience?" : "How was your experience?"}
              className="mb-2 w-full resize-none rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            <button onClick={sendFeedback}
              className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-[12px] font-semibold text-stone-700 transition hover:bg-stone-100 active:scale-95">
              Send feedback 
            </button>
            {fbStatus && <p className="mt-2 text-[12px] text-emerald-700">{fbStatus}</p>}
          </div>

          <div className="au au-4 mt-4 text-center">
            <Link to="/" className="text-[12px] text-stone-400 underline underline-offset-2">Back to home</Link>
          </div>
        </div>
      </main>
    );
  }

  /*  Checkout state  */
  const ctaLabel = isPaying ? "Processing..." : `Pay ${displayPlanAmount} | Get share link`;

  return (
    <main className="pay-root min-h-screen pb-36">
      <style>{CSS}</style>

      {/* floating bg doodles WD */}
      {wdActive && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <DoodleFlower className="absolute -top-2 left-1 h-14 w-14 fp2 opacity-[.12]" />
          <DoodleFlower className="absolute top-10 right-2 h-10 w-10 fp3 opacity-[.09]" />
          <DoodleSparkle className="absolute top-28 left-1/4 h-7 w-7 fp1 opacity-[.16]" />
          <DoodleStar className="absolute top-8  right-1/3 h-8 w-8 fp2 opacity-[.13]" />
          <DoodleLeaf className="absolute bottom-40 -right-1 h-11 w-10 fp3 opacity-[.10]" />
        </div>
      )}

      {/*  Sticky header  */}
      <header className="sticky top-0 z-30 border-b border-rose-100/60 backdrop-blur"
        style={{ background: "rgba(253,246,240,.97)" }}>

        {/* WD ticker */}
        {wdActive && (
          <div className="overflow-hidden border-b border-rose-200/50 py-1.5"
            style={{ background: "linear-gradient(90deg,#3a3028,#8e3e3a,#c0605a,#8e3e3a,#3a3028)" }}>
            <div className="flex ticker-track whitespace-nowrap select-none">
              {[0, 1].map(gi => (
                <span key={gi} className="flex shrink-0 items-center gap-8 px-6 text-[11px] font-medium text-rose-100/90">
                  {[" Happy Women's Day  March 8",
                    " She deserves more than a text",
                    " Today-only special offer",
                    " Pay  Get link  Share on WhatsApp",
                    " Almost there  just one step left",
                  ].map((t, i) => (
                    <span key={i} className="flex items-center gap-8">{t}<span className="text-rose-400/50"></span></span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-sm items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="Petals and Words" className="h-8 w-auto" />
            {wdActive && (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                 Women's Day
              </span>
            )}
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
             Secure
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-sm space-y-4 px-4 pt-5">

        {/*  WD top banner  */}
        {wdActive && (
          <div className="au au-1">
            <div className="relative overflow-hidden rounded-2xl px-4 py-4"
              style={{ background: "linear-gradient(135deg,#3a3028 0%,#8e3e3a 55%,#c0605a 100%)" }}>
              <DoodleWreathLeft className="absolute left-0 top-0 h-full w-10 opacity-35" />
              <DoodleWreathRight className="absolute right-0 top-0 h-full w-10 opacity-35" />
              <DoodleSparkle className="absolute top-2 right-16 h-5 w-5 fp3 opacity-40" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-200">March 8  Final step</p>
                  <p className="mt-0.5 text-[1.15rem] font-light leading-tight text-white"
                    style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                    <em>She's worth every rupee.</em>
                  </p>
                  <p className="mt-0.5 text-[11px] text-rose-100/80">This offer disappears at midnight</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-300">Ends in</p>
                  <MidnightCountdown dark />
                </div>
              </div>
            </div>
          </div>
        )}

        {/*  Heading  */}
        <div className="au au-1 text-center">
          {wdActive ? (
            <>
              <div className="mb-1 flex items-center justify-center gap-2">
                <DoodleStar className="h-5 w-5 opacity-65" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-rose-500">Women's Day  Final step</p>
                <DoodleStar className="h-5 w-5 opacity-65" />
              </div>
              <h1 className="text-[1.85rem] font-light leading-tight text-stone-900"
                style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                Almost there {" "}
                <em className="wd-shimmer">pay &amp; make her day</em>
              </h1>
              <p className="mt-2 text-[13px] text-stone-500">One payment. Instant link. She sees it in seconds.</p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">Final step</p>
              <h1 className="mt-1 text-[1.85rem] font-light leading-tight text-stone-800"
                style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                Almost there  <em>pay &amp; share</em>
              </h1>
              <p className="mt-1.5 text-[13px] text-stone-500">One-time payment. Instant link. No subscription ever.</p>
            </>
          )}
        </div>

        {/*  Social proof  */}
        <div className="au au-2"><SocialProofTicker wdActive={wdActive} /></div>

        {/*  Bouquet preview  */}
        <div className="au au-2">
          <BouquetPreview flowerCount={flowerCount} wordCount={wordCount} note={note} wdActive={wdActive} />
        </div>

        {/*  Plan selector  */}
        <div className="au au-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-md">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Choose your plan</p>
          <div className="space-y-2">
            {plans.map(plan => {
              const isSelected = selectedPlanId === plan.id;
              const isTooSmall = plan.id === "small" && requiredPlanId !== "small";
              const planAmount = formatUsdFromCents(plan.amountCents);
              const planOriginal = plan.originalCents ? formatUsdFromCents(plan.originalCents) : null;
              return (
                <button key={plan.id} type="button"
                  onClick={() => !isTooSmall && setSelectedPlanId(plan.id)}
                  disabled={isTooSmall}
                  className={["plan-card", isSelected ? "selected" : "", isTooSmall ? "opacity-50 cursor-not-allowed" : ""].join(" ")}>
                  <div className="flex items-center gap-3">
                    <div className="plan-radio" />
                    <span className="text-xl">{plan.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-stone-800">{plan.label}</span>
                        {plan.badge && <span className="rounded-full bg-[#c0605a] px-2 py-0.5 text-[10px] font-semibold text-white">{plan.badge}</span>}
                        {offerActive && plan.id === "small" && <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">Sale</span>}
                        {wdActive && plan.id === "small" && !isTooSmall && <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700"> WD</span>}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{plan.sublabel}</p>
                      {isTooSmall && <p className="text-[11px] text-amber-600 mt-0.5">Your bouquet exceeds this plan's limit</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {planOriginal && <p className="text-[11px] text-stone-400 line-through leading-none">{planOriginal}</p>}
                      <p className="text-[16px] font-semibold text-[#8e3e3a]">{planAmount}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-2.5">
            <span className="text-sm"></span>
            <p className="text-[12px] text-stone-600">UPI | Credit/Debit | Netbanking | Wallets</p>
          </div>
        </div>

        {/*  Sender name  */}
        <div className="au au-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <label htmlFor="sender-name" className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 mb-2">
            {wdActive ? "Sign her bouquet (optional)" : "Sign your bouquet (optional)"}
          </label>
          <input id="sender-name" type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
            placeholder={wdActive ? "Your name, e.g. Priya" : "Your name, e.g. Rahul"}
            className="w-full rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-3 text-[14px] text-stone-800 outline-none transition focus:border-[#c0605a] focus:ring-2 focus:ring-[#c0605a]/15" />
          <p className="mt-1.5 text-[11px] text-stone-400">
            {wdActive ? "She'll see \"From [name]\" with her bouquet " : "Shown to the recipient as \"From [name]\""}
          </p>
        </div>

        {/*  WD midnight countdown strip  */}
        {wdActive && (
          <div className="au au-4 relative overflow-hidden rounded-2xl px-4 py-4"
            style={{ background: "linear-gradient(135deg,#3a3028,#8e3e3a)" }}>
            <DoodleLeaf className="absolute -right-1 bottom-0 h-14 w-12 rotate-12 opacity-20" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200">Offer ends at midnight</p>
                <p className="mt-0.5 text-[13px] text-white">
                  {offerActive ? `Special price: ${formatUsdFromCents(getSmallPlanUsdCents())}` : `Plans from ${formatUsdFromCents(getSmallPlanUsdCents())} | One-time`}
                </p>
              </div>
              <MidnightCountdown dark />
            </div>
          </div>
        )}

        {/*  Offer banner (non-WD)  */}
        {offerActive && !wdActive && (
          <div className="au au-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-3">
            <span className="text-xl shrink-0"></span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-stone-800 leading-tight">Limited offer active</p>
              <p className="text-[11px] text-stone-500">Small plan discounted | {getOfferDateLabel()}</p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">Save now</span>
          </div>
        )}

        {/*  Trust bar  */}
        <div className="au au-4 rounded-2xl border border-stone-100 bg-white px-3 py-2 shadow-sm">
          <TrustBar />
        </div>

        {/*  Guarantee  */}
        <div className="au au-5 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <span className="text-xl shrink-0"></span>
          <div>
            <p className="text-[12px] font-semibold text-emerald-900">
              {wdActive ? "Every Women's Day bouquet is guaranteed" : "We stand behind every bouquet"}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              Payment secured by Razorpay. If anything goes wrong after payment, email {supportEmail} and we'll fix it within hours.
            </p>
          </div>
        </div>

        {/*  WD emotional closer  */}
        {wdActive && (
          <div className="au au-5 relative overflow-hidden rounded-2xl border border-rose-100 bg-white px-4 py-4 text-center">
            <DoodleFlower className="absolute -left-2 -top-2 h-12 w-12 fp2 opacity-20" />
            <DoodleFlower className="absolute -right-2 -top-2 h-10 w-10 fp3 opacity-15" style={{ transform: "scaleX(-1)" }} />
            <p className="text-[1.1rem] font-light italic text-stone-700 leading-relaxed"
              style={{ fontFamily: '"Cormorant Garamond",serif' }}>
              "The best gifts are the ones that show you were thinking of her."
            </p>
            <p className="mt-1 text-[11px] text-stone-400">Happy Women's Day </p>
          </div>
        )}

        {/*  Error message  */}
        {checkoutMsg && !hasPaid && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
            {checkoutMsg}
          </div>
        )}

        {/* spacer for fixed CTA */}
        <div className="h-4" />
      </div>

      {/*  Fixed bottom CTA  */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100/60 px-4 pb-5 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur"
        style={{ background: "rgba(253,246,240,.97)" }}>
        <div className="mx-auto max-w-sm">
          {/* WD emotional nudge above CTA */}
          {wdActive && hasBouquetData && (
            <p className="mb-2 text-center text-[11px] font-medium text-rose-600">
               She'll see this on Women's Day  make it count
            </p>
          )}

          <button type="button" onClick={completeCheckout} disabled={isCtaDisabled}
            className={["pay-cta", !isCtaDisabled ? "cta-glow" : ""].join(" ")}>
            {isPaying ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                 {wdActive ? `Pay ${displayPlanAmount}  Gift her this moment` : ctaLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-stone-400">
            <span> One-time</span><span></span>
            <span> Instant link</span><span></span>
            <span> Razorpay</span>
            {wdActive && <><span></span><span className="font-medium text-rose-500"> WD Special</span></>}
          </div>

          {!canKeepEverything && (
            <p className="mt-1.5 text-center text-[11px] text-amber-700">
              Upgrade to Unlimited to include your full bouquet
            </p>
          )}
        </div>
      </div>

      {/* Low-prominence back link */}
      <div className="relative z-10 mx-auto max-w-sm px-4 pb-2 pt-3 text-center">
        <button type="button" onClick={() => navigate(-1)}
          className="text-[12px] text-stone-400 underline underline-offset-2 hover:text-stone-600">
           Edit my bouquet
        </button>
      </div>
    </main>
  );
}
