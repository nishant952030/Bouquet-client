import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { trackEvent } from "../lib/analytics";
import {
  getOfferDateLabel,
  getSmallPlanOriginalPrice,
  getSmallPlanPrice,
  getUnlimitedPlanPrice,
  isLaunchOfferActive,
} from "../lib/pricing";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";
import { clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft } from "../lib/checkoutStorage";

/* ─── constants ─────────────────────────────────────── */
const PENDING_GLOBAL_CHECKOUT_KEY = "pw_pending_global_checkout";

/* ─── helpers ───────────────────────────────────────── */
function countWords(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}
function getRequiredPlan(flowerCount, wordCount) {
  if (flowerCount <= 5 && wordCount <= 60) return "small";
  return "medium";
}
function trackCheckoutEvent(eventName, payload) {
  track(eventName, payload);
  trackEvent(eventName, payload);
}
function getPendingCheckoutData() {
  try {
    const raw = localStorage.getItem(PENDING_GLOBAL_CHECKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.stems)) return null;
    return parsed;
  } catch { return null; }
}
async function readApiPayload(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try { return await response.json(); } catch { return null; }
  }
  try {
    const text = await response.text();
    if (!text) return null;
    return { error: text };
  } catch { return null; }
}

/* ─── styles ────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  .pay-root {
    font-family: 'Jost', sans-serif;
    min-height: 100vh;
    background: #faf6f0;
  }

  /* Grain overlay */
  .pay-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .au { animation: fadeUp .45s ease forwards; }
  .au-1 { animation-delay:.05s; opacity:0; }
  .au-2 { animation-delay:.15s; opacity:0; }
  .au-3 { animation-delay:.25s; opacity:0; }
  .au-4 { animation-delay:.35s; opacity:0; }
  .au-5 { animation-delay:.45s; opacity:0; }
  .au-6 { animation-delay:.55s; opacity:0; }

  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(192,96,90,.35); }
    50%      { box-shadow: 0 0 0 8px rgba(192,96,90,0); }
  }
  .pay-btn-pulse { animation: pulseGlow 2.4s ease-in-out infinite; }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer-loading {
    background: linear-gradient(90deg,#f0e4d8 25%,#faf6f0 50%,#f0e4d8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes checkPop {
    0%   { transform: scale(0) rotate(-10deg); opacity:0; }
    70%  { transform: scale(1.2) rotate(4deg);  opacity:1; }
    100% { transform: scale(1) rotate(0deg);    opacity:1; }
  }
  .check-pop { animation: checkPop .5s cubic-bezier(.34,1.56,.64,1) forwards; }

  /* Trust seal */
  .trust-seal {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #7a6e65;
    font-weight: 500;
  }
  .trust-seal-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 1px solid #e8d5cd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
  }

  /* Plan card */
  .plan-card {
    border-radius: 16px;
    border: 2px solid transparent;
    background: #faf6f0;
    padding: 14px 16px;
    cursor: pointer;
    transition: all .18s ease;
    position: relative;
    overflow: hidden;
  }
  .plan-card.selected {
    border-color: #c0605a;
    background: #fff5f4;
  }
  .plan-card:not(.selected):hover {
    border-color: #e8a9a4;
    background: white;
  }
  .plan-card-radio {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 2px solid #d0c4bc;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all .15s;
  }
  .plan-card.selected .plan-card-radio {
    border-color: #c0605a;
    background: #c0605a;
  }
  .plan-card-radio::after {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: white;
    display: none;
  }
  .plan-card.selected .plan-card-radio::after { display: block; }

  /* Pay CTA */
  .pay-cta {
    width: 100%;
    min-height: 56px;
    border-radius: 18px;
    background: #3a3028;
    color: #faf6f0;
    border: none;
    font-family: 'Jost', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: .08em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all .22s ease;
    position: relative;
    overflow: hidden;
  }
  .pay-cta:hover:not(:disabled) {
    background: #8e3e3a;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(142,62,58,.3);
  }
  .pay-cta:active:not(:disabled) { transform: translateY(0) scale(.98); }
  .pay-cta:disabled {
    background: #e2d8d0;
    color: #b5a89e;
    cursor: not-allowed;
  }

  /* Success card */
  .success-card {
    border-radius: 20px;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1.5px solid #86efac;
    padding: 24px 20px;
  }
  .share-url-box {
    background: white;
    border: 1.5px solid #86efac;
    border-radius: 12px;
    padding: 12px 16px;
    word-break: break-all;
    font-size: 13px;
    color: #166534;
    font-family: 'Jost', monospace;
    line-height: 1.5;
  }

  /* Urgency badge */
  @keyframes blink {
    0%,100% { opacity:1; }
    50%      { opacity:.5; }
  }
  .urgency-dot { animation: blink 1.6s ease-in-out infinite; }
`;

/* ─── sub-components ─────────────────────────────────── */
function TrustBar() {
  const items = [
    { icon: "🔒", label: "256-bit SSL" },
    { icon: "⚡", label: "Instant link" },
    { icon: "💳", label: "UPI · Cards · Wallets" },
    { icon: "✅", label: "10,000+ bouquets sent" },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-3">
      {items.map((item) => (
        <div key={item.label} className="trust-seal">
          <div className="trust-seal-icon">{item.icon}</div>
          {item.label}
        </div>
      ))}
    </div>
  );
}

function SocialProofTicker() {
  const proofs = [
    "Arjun from Bengaluru just sent a bouquet 🌸",
    "Neha from Delhi sent one 2 min ago 💐",
    "Rahul from Pune just paid · link shared 🌺",
    "Aditi from Mumbai loved her bouquet ✨",
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % proofs.length);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [proofs.length]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
      <span className="urgency-dot h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      <p
        className="text-[12px] text-emerald-800 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {proofs[idx]}
      </p>
    </div>
  );
}

function BouquetSummaryPreview({ flowerCount, wordCount, note }) {
  const preview = note?.trim().slice(0, 60);
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
        Your bouquet
      </p>
      <div className="flex items-center gap-4">
        {/* Flower count visual */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-rose-100 bg-[#faf6f0] px-4 py-3 min-w-[64px]">
          <span className="text-2xl leading-none">🌸</span>
          <span className="mt-1 text-[11px] font-semibold text-stone-700">{flowerCount} stems</span>
        </div>
        <div className="flex-1 min-w-0">
          {preview ? (
            <>
              <p
                className="text-[14px] italic leading-relaxed text-stone-700 line-clamp-2"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "15px" }}
              >
                "{preview}{note.trim().length > 60 ? "…" : ""}"
              </p>
              <p className="mt-1 text-[11px] text-stone-400">{wordCount} words in your note</p>
            </>
          ) : (
            <p className="text-[13px] text-stone-400 italic" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              No note added · bouquet only
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────── */
export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const offerActive = isLaunchOfferActive();

  const pendingCheckout = useMemo(() => getPendingCheckoutData(), []);
  const checkoutDraft = useMemo(() => loadCheckoutDraft(), []);
  const stems = location.state?.stems ?? pendingCheckout?.stems ?? checkoutDraft?.stems ?? [];
  const note = location.state?.note ?? pendingCheckout?.note ?? checkoutDraft?.note ?? "";
  const initialSenderName = location.state?.senderName ?? pendingCheckout?.senderName ?? checkoutDraft?.senderName ?? "";
  const hasBouquetData = stems.length > 0 || countWords(note) > 0;

  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const requiredPlanId = useMemo(() => getRequiredPlan(flowerCount, wordCount), [flowerCount, wordCount]);

  const [selectedPlanId, setSelectedPlanId] = useState(requiredPlanId);
  const [senderName, setSenderName] = useState(initialSenderName);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hasPaidSuccessfully, setHasPaidSuccessfully] = useState(false);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const countryCode = "IN";
  const isDetectingCountry = false;
  const isVerifyingStripeReturn = false;
  const [copied, setCopied] = useState(false);

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@petalsandwords.com";

  const isIndiaUser = true;
  const paymentProvider = "razorpay";

  const plans = useMemo(() => {
    const smallInr = getSmallPlanPrice();
    const smallOriginalInr = getSmallPlanOriginalPrice();
    const unlimitedInr = getUnlimitedPlanPrice();
    return [
      {
        id: "small",
        label: "Small",
        sublabel: "Up to 5 flowers · 60 words",
        emoji: "🌷",
        inrValue: smallInr,
        inrOriginalValue: smallOriginalInr,
      },
      {
        id: "medium",
        label: "Unlimited",
        sublabel: "Unlimited flowers & words",
        emoji: "💐",
        inrValue: unlimitedInr,
        inrOriginalValue: null,
        badge: "Most popular",
      },
    ];
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0];
  const visiblePlans = plans;
  const canKeepEverything = selectedPlanId === "medium" || requiredPlanId === "small";
  const displayPlanAmount = `Rs ${selectedPlan.inrValue}`;
  const selectedPlanAmountInMinor = Math.round(selectedPlan.inrValue * 100);

  /* ── effects ── */
  useEffect(() => {
    applySeo({
      title: "Checkout · Petals and Words",
      description: "Complete bouquet checkout and get your share link instantly.",
      keywords: seoKeywords.payment,
      path: "/payment",
      robots: "noindex,nofollow",
    });
  }, []);

  useEffect(() => {
    trackCheckoutEvent("checkout_page_view", { flowerCount, wordCount, requiredPlanId, countryCode, paymentProvider });
  }, [countryCode, flowerCount, paymentProvider, requiredPlanId, wordCount]);

  useEffect(() => {
    if (!hasBouquetData) return;
    saveCheckoutDraft({ stems, note, senderName });
  }, [hasBouquetData, note, senderName, stems]);

  useEffect(() => {
    if (hasPaidSuccessfully) return undefined;
    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      const shouldLeave = window.confirm("Are you sure you want to leave checkout?");
      if (shouldLeave) { window.removeEventListener("popstate", onPopState); navigate(-1); }
      else window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [hasPaidSuccessfully, navigate]);

  /* ── payment logic (unchanged logic, same as original) ── */
  const createShareLink = async (paymentMeta = null) => {
    const id = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      stems, note, plan: selectedPlanId,
      senderName: senderName.trim(),
      payment: paymentMeta,
      createdAt: new Date().toISOString(),
    };
    try {
      if (isFirebaseConfigured && db) await setDoc(doc(db, "bouquets", id), payload);
      localStorage.setItem(`bouquet_share_${id}`, JSON.stringify(payload));
      localStorage.removeItem(PENDING_GLOBAL_CHECKOUT_KEY);
      clearCheckoutDraft();
    } catch (error) {
      console.error("Unable to save bouquet share data", error);
      setCheckoutMessage("Payment captured, but link save failed. Contact support.");
      return false;
    }
    const url = `${window.location.origin}/view/${id}`;
    setShareUrl(url);
    setHasPaidSuccessfully(true);
    setCheckoutMessage("Payment successful. Share link ready.");
    trackCheckoutEvent("payment_success", { selectedPlanId, provider: paymentProvider, countryCode });
    return true;
  };


  const startRazorpayCheckout = async () => {
    if (!razorpayKeyId) { setCheckoutMessage("Payment is not configured."); return; }
    const razorpayReady = await loadRazorpayScript();
    if (!razorpayReady || !window.Razorpay) { setCheckoutMessage("Unable to load payment gateway."); return; }
    const orderResponse = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise: selectedPlanAmountInMinor, currency: "INR", notes: { selectedPlanId, flowers: String(flowerCount), words: String(wordCount) } }),
    });
    const orderData = await readApiPayload(orderResponse);
    if (!orderResponse.ok || !orderData?.orderId) {
      throw new Error(
        orderData?.error || "Unable to create payment order. Check Vercel env: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      );
    }
    const options = {
      key: razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: "Petals and Words",
      description: `${selectedPlan.label} plan`,
      prefill: { name: senderName.trim() || "Someone special" },
      notes: { selectedPlanId },
      theme: { color: "#c0605a" },
      handler: async (response) => {
        try {
          const verifyResponse = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await readApiPayload(verifyResponse);
          if (!verifyResponse.ok || !verifyData?.ok) throw new Error(verifyData?.error || "Payment verification failed");
          await createShareLink({ provider: "razorpay", razorpay_order_id: response?.razorpay_order_id || "", razorpay_payment_id: response?.razorpay_payment_id || "" });
        } catch (error) {
          console.error(error);
          setCheckoutMessage("Payment received but verification failed. Contact support.");
        } finally { setIsProcessingPayment(false); }
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          setCheckoutMessage("Payment cancelled. Tap Pay again when ready.");
          trackCheckoutEvent("payment_drop", { provider: "razorpay", reason: "payment_modal_dismissed" });
        },
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      setCheckoutMessage("Payment did not complete. Try again.");
      setIsProcessingPayment(false);
      trackCheckoutEvent("payment_failed", { provider: "razorpay", code: response?.error?.code || "unknown", reason: response?.error?.reason || "unknown" });
    });
    razorpay.open();
  };

  const completeCheckout = async () => {
    if (!canKeepEverything || isProcessingPayment || isVerifyingStripeReturn || isDetectingCountry) return;
    setCheckoutMessage("");
    setIsProcessingPayment(true);
    trackCheckoutEvent("payment_attempt", { selectedPlanId, provider: paymentProvider, countryCode, amount: selectedPlanAmountInMinor });
    try {
      await startRazorpayCheckout();
    } catch (error) {
      console.error(error);
      setCheckoutMessage(error?.message || "Unable to start payment.");
      setIsProcessingPayment(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setCheckoutMessage("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2200);
    } catch { setCheckoutMessage("Copy failed. Copy manually."); }
  };

  const sendPostPaymentFeedback = (event) => {
    event.preventDefault();
    const message = feedbackMessage.trim();
    if (!message) { setFeedbackStatus("Please add feedback first."); return; }
    const subject = encodeURIComponent("Post-purchase feedback - Petals and Words");
    const body = encodeURIComponent(`Name: ${feedbackName.trim() || "Anonymous"}\nPlan: ${selectedPlanId}\nProvider: ${paymentProvider}\n\nFeedback:\n${message}`);
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    setFeedbackStatus(`Thanks. Draft opened for ${supportEmail}.`);
  };

  /* ── no bouquet ── */
  if (!hasBouquetData) {
    return (
      <main className="pay-root flex min-h-screen items-center justify-center px-4 py-8">
        <style>{styles}</style>
        <div className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-6 shadow-xl text-center">
          <p className="text-4xl mb-3">🌸</p>
          <h1 className="text-xl font-light text-stone-800" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            No bouquet found
          </h1>
          <p className="mt-2 text-sm text-stone-500">Create your bouquet first, then come back to pay.</p>
          <Link to="/create" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3a3028] px-5 py-3 text-sm font-semibold text-[#faf6f0]">
            Create bouquet →
          </Link>
        </div>
      </main>
    );
  }

  /* ── success state ── */
  if (hasPaidSuccessfully && shareUrl) {
    return (
      <main className="pay-root min-h-screen px-4 pb-16 pt-8">
        <style>{styles}</style>
        <div className="mx-auto max-w-sm">
          <div className="mb-6 text-center au au-1">
            <div className="check-pop mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-50 text-3xl shadow-lg">
              ✅
            </div>
            <h1 className="text-2xl font-light text-stone-800" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Payment successful!
            </h1>
            <p className="mt-1 text-sm text-stone-500">Your bouquet is live. Share the link below.</p>
          </div>

          <div className="success-card au au-2 mb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Your share link</p>
            <div className="share-url-box mb-3">{shareUrl}</div>
            <div className="flex gap-2">
              <button
                onClick={copyShareLink}
                className={[
                  "flex-1 rounded-xl py-3 text-[13px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-95",
                  copied ? "bg-emerald-700 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700",
                ].join(" ")}
              >
                {copied ? "✓ Copied!" : "Copy link"}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Here's a bouquet I made for you 🌸 " + shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-all hover:bg-[#1da851] active:scale-95"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L.057 23.272a.75.75 0 00.914.914l5.427-1.47A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-5.2-1.501l-.373-.221-3.87 1.048 1.048-3.834-.241-.385A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" /></svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Feedback */}
          <div className="au au-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Quick feedback</p>
            <input
              type="text"
              value={feedbackName}
              onChange={(e) => setFeedbackName(e.target.value)}
              placeholder="Your name (optional)"
              className="mb-2 w-full rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
            <textarea
              rows={3}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="How was your experience?"
              className="mb-2 w-full resize-none rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
            <button
              onClick={sendPostPaymentFeedback}
              className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-[12px] font-semibold text-stone-700 transition hover:bg-stone-100 active:scale-95"
            >
              Send feedback →
            </button>
            {feedbackStatus && <p className="mt-2 text-[12px] text-emerald-700">{feedbackStatus}</p>}
          </div>

          <div className="au au-4 mt-4 text-center">
            <Link to="/" className="text-[12px] text-stone-400 underline underline-offset-2">Back to home</Link>
          </div>
        </div>
      </main>
    );
  }

  /* ── checkout state ── */
  const isLoading = isDetectingCountry || isVerifyingStripeReturn;
  const isCtaDisabled = !canKeepEverything || isProcessingPayment || isLoading;

  const ctaLabel = isDetectingCountry
    ? "Loading checkout..."
    : isVerifyingStripeReturn
      ? "Verifying payment..."
      : isProcessingPayment
        ? "Processing..."
        : isIndiaUser
          ? `Pay ${displayPlanAmount} · Get share link`
          : `Pay ${displayPlanAmount} · Get share link`;

  return (
    <main className="pay-root min-h-screen pb-32">
      <style>{styles}</style>

      {/* ── sticky top nav ── */}
      <header className="sticky top-0 z-30 border-b border-rose-100/60 bg-[#faf6f0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-sm items-center justify-between gap-3 px-4 py-3">
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              🔒 Secure checkout
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-sm px-4 pt-5 space-y-4">

        {/* ── heading ── */}
        <div className="au au-1 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">Final step</p>
          <h1 className="mt-1 text-[1.85rem] font-light text-stone-800 leading-tight" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Almost there — <em>pay &amp; share</em>
          </h1>
          <p className="mt-1.5 text-[13px] text-stone-500">One-time payment. Instant link. No subscription ever.</p>
        </div>

        {/* ── social proof ticker ── */}
        <div className="au au-2">
          <SocialProofTicker />
        </div>

        {/* ── bouquet preview ── */}
        <div className="au au-2">
          <BouquetSummaryPreview flowerCount={flowerCount} wordCount={wordCount} note={note} />
        </div>

        {/* ── plan selector ── */}
        <div className="au au-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-md">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Choose your plan</p>

          {isDetectingCountry ? (
            <div className="space-y-2">
              <div className="shimmer-loading h-16 rounded-2xl" />
              <div className="shimmer-loading h-16 rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-2">
              {visiblePlans.map((plan) => {
                const planAmount = `Rs ${plan.inrValue}`;
                const planOriginal = isIndiaUser && plan.inrOriginalValue ? `₹${plan.inrOriginalValue}` : null;
                const isSelected = selectedPlanId === plan.id;
                const isTooSmall = plan.id === "small" && requiredPlanId !== "small";
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => !isTooSmall && setSelectedPlanId(plan.id)}
                    disabled={isTooSmall}
                    className={["plan-card w-full text-left", isSelected ? "selected" : "", isTooSmall ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="plan-card-radio" />
                      <span className="text-xl">{plan.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-stone-800">{plan.label}</span>
                          {plan.badge && (
                            <span className="rounded-full bg-[#c0605a] px-2 py-0.5 text-[10px] font-semibold text-white">
                              {plan.badge}
                            </span>
                          )}
                          {offerActive && plan.id === "small" && isIndiaUser && (
                            <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              Sale
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400">{plan.sublabel}</p>
                        {isTooSmall && <p className="text-[11px] text-amber-600 mt-0.5">Your bouquet exceeds this plan's limit</p>}
                      </div>
                      <div className="text-right shrink-0">
                        {planOriginal && (
                          <p className="text-[11px] text-stone-400 line-through leading-none">{planOriginal}</p>
                        )}
                        <p className="text-[16px] font-semibold text-[#8e3e3a]">{planAmount}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Payment methods */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-2.5">
            <span className="text-sm">💳</span>
            <p className="text-[12px] text-stone-600">
              {isIndiaUser
                ? "UPI · Credit/Debit · Netbanking · Wallets"
                : "International cards · Apple Pay · Google Pay"}
            </p>
          </div>
        </div>

        {/* ── sender name ── */}
        <div className="au au-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
          <label htmlFor="sender-name" className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 mb-2">
            Sign your bouquet (optional)
          </label>
          <input
            id="sender-name"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name, e.g. Rahul"
            className="w-full rounded-xl border border-stone-100 bg-[#faf6f0] px-3 py-3 text-[14px] text-stone-800 outline-none transition focus:border-[#c0605a] focus:ring-2 focus:ring-[#c0605a]/15"
          />
          <p className="mt-1.5 text-[11px] text-stone-400">Shown to the recipient as "From [name]"</p>
        </div>

        {/* ── offer banner ── */}
        {offerActive && isIndiaUser && (
          <div className="au au-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-3">
            <span className="text-xl shrink-0">⏰</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-stone-800 leading-tight">Limited offer active</p>
              <p className="text-[11px] text-stone-500">Small plan discounted · {getOfferDateLabel()}</p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              Save now
            </span>
          </div>
        )}

        {/* ── trust bar ── */}
        <div className="au au-4 rounded-2xl border border-stone-100 bg-white px-3 py-2 shadow-sm">
          <TrustBar />
        </div>

        {/* ── guarantee ── */}
        <div className="au au-4 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <span className="text-xl shrink-0">🛡️</span>
          <div>
            <p className="text-[12px] font-semibold text-emerald-900">We stand behind every bouquet</p>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              Payment secured by {isIndiaUser ? "Razorpay" : "Stripe"}. If anything goes wrong after payment, email us at {supportEmail} and we'll fix it.
            </p>
          </div>
        </div>

        {/* ── error message ── */}
        {checkoutMessage && !hasPaidSuccessfully && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
            {checkoutMessage}
          </div>
        )}
      </div>

      {/* ── fixed bottom CTA ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100/60 bg-[#faf6f0]/97 px-4 pb-safe pt-3 pb-5 shadow-[0_-8px_30px_rgba(0,0,0,0.07)] backdrop-blur">
        <div className="mx-auto max-w-sm">
          <button
            type="button"
            onClick={completeCheckout}
            disabled={isCtaDisabled}
            className={["pay-cta", !isCtaDisabled ? "pay-btn-pulse" : ""].join(" ")}
          >
            {isProcessingPayment || isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {ctaLabel}
              </>
            ) : (
              <>
                🔒 {ctaLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          {/* Sub-CTA micro-copy — key for conversion */}
          <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-stone-400">
            <span>✅ One-time only</span>
            <span>·</span>
            <span>⚡ Instant link</span>
            <span>·</span>
            <span>🔒 {isIndiaUser ? "Razorpay" : "Stripe"} secured</span>
          </div>

          {!canKeepEverything && (
            <p className="mt-1.5 text-center text-[11px] text-amber-700">
              Upgrade to Unlimited to include your full bouquet
            </p>
          )}
        </div>
      </div>

      {/* back link — low prominence so it doesn't distract */}
      <div className="mx-auto max-w-sm px-4 pt-3 pb-2 text-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[12px] text-stone-400 underline underline-offset-2 hover:text-stone-600"
        >
          ← Edit my bouquet
        </button>
      </div>
    </main>
  );
}
