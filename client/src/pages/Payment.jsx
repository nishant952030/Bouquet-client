import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";

const PLAN_ORDER = ["free", "small", "medium", "large"];

const PLANS = [
  {
    id: "free",
    name: "Free",
    priceLabel: "Free",
    priceValue: 0,
    flowerLimit: 2,
    wordLimit: 20,
    features: ["Watermark preview", "Best for trying the builder"],
  },
  {
    id: "small",
    name: "Small",
    originalPriceLabel: "Rs 49",
    priceLabel: "Rs 29",
    priceValue: 29,
    flowerLimit: 5,
    wordLimit: 60,
    features: ["No watermark", "Shareable link", "HD image export"],
    recommended: true,
  },
  {
    id: "medium",
    name: "Medium",
    originalPriceLabel: "Rs 89",
    priceLabel: "Rs 59",
    priceValue: 59,
    flowerLimit: 10,
    wordLimit: 150,
    features: ["No watermark", "Shareable link", "More flowers and words"],
  },
  {
    id: "large",
    name: "Large",
    originalPriceLabel: "Rs 149",
    priceLabel: "Rs 99",
    priceValue: 99,
    flowerLimit: Infinity,
    wordLimit: Infinity,
    features: ["No watermark", "Unlimited bouquet", "Premium styles / animation"],
  },
];

function countWords(text) {
  const normalized = text.trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}

function getRequiredPlan(flowerCount, wordCount) {
  if (flowerCount <= 2 && wordCount <= 20) return "free";
  if (flowerCount <= 5 && wordCount <= 60) return "small";
  if (flowerCount <= 10 && wordCount <= 150) return "medium";
  return "large";
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const stems = location.state?.stems ?? [];
  const note = location.state?.note ?? "";
  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const hasBouquetData = flowerCount > 0 || wordCount > 0;
  const requiredPlanId = useMemo(() => getRequiredPlan(flowerCount, wordCount), [flowerCount, wordCount]);
  const [selectedPlanId, setSelectedPlanId] = useState(requiredPlanId === "free" ? "small" : requiredPlanId);
  const [shareUrl, setShareUrl] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasPaidSuccessfully, setHasPaidSuccessfully] = useState(false);
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const selectedPlan = PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[1];
  const requiredPlan = PLANS.find((plan) => plan.id === requiredPlanId) ?? PLANS[0];
  const canKeepEverything = PLAN_ORDER.indexOf(selectedPlanId) >= PLAN_ORDER.indexOf(requiredPlanId);

  useEffect(() => {
    applySeo({
      title: "Bouquet Plans and Checkout",
      description:
        "Select a bouquet plan to keep all flowers and note words, then generate a share link after checkout.",
      keywords: seoKeywords.payment,
      path: "/payment",
      robots: "noindex,nofollow",
    });
  }, []);

  const createShareLink = async (paymentMeta = null) => {
    const id = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      stems,
      note,
      plan: selectedPlanId,
      senderName: senderName.trim(),
      payment: paymentMeta,
      createdAt: new Date().toISOString(),
    };

    try {
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, "bouquets", id), payload);
      }
      localStorage.setItem(`bouquet_share_${id}`, JSON.stringify(payload));
    } catch (error) {
      console.error("Unable to save bouquet share data", error);
      alert("Unable to save share data.");
      return false;
    }

    const url = `${window.location.origin}/view/${id}`;
    setShareUrl(url);
    setCheckoutMessage("Payment successful. Your bouquet is now ready to share.");
    setHasPaidSuccessfully(true);
    return true;
  };

  const completeCheckout = async () => {
    if (!canKeepEverything || isProcessingPayment) return;
    setCheckoutMessage("");
    setIsProcessingPayment(true);

    if (selectedPlanId === "free") {
      setShareUrl("");
      setCheckoutMessage("You are on Free preview with watermark. Upgrade anytime to unlock sharing.");
      setIsProcessingPayment(false);
      return;
    }

    if (!razorpayKeyId) {
      setCheckoutMessage("Razorpay is not configured. Add VITE_RAZORPAY_KEY_ID in client/.env.");
      setIsProcessingPayment(false);
      return;
    }

    const razorpayReady = await loadRazorpayScript();
    if (!razorpayReady || !window.Razorpay) {
      setCheckoutMessage("Unable to load payment gateway. Please try again.");
      setIsProcessingPayment(false);
      return;
    }

    const options = {
      key: razorpayKeyId,
      amount: Math.round(selectedPlan.priceValue * 100),
      currency: "INR",
      name: "Petals and Words",
      description: `${selectedPlan.name} plan`,
      prefill: {
        name: senderName.trim(),
      },
      notes: {
        flowerCount: String(flowerCount),
        wordCount: String(wordCount),
        selectedPlanId,
      },
      theme: {
        color: "#f43f5e",
      },
      handler: async (response) => {
        const success = await createShareLink({
          provider: "razorpay",
          razorpay_payment_id: response?.razorpay_payment_id || "",
        });
        if (!success) {
          setCheckoutMessage("Payment was captured, but saving your share link failed. Please contact support.");
        }
        setIsProcessingPayment(false);
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setCheckoutMessage("Payment failed. Please try again.");
        setIsProcessingPayment(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Unable to open Razorpay checkout", error);
      setCheckoutMessage("Unable to start payment right now. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied.");
    } catch (error) {
      console.error("Failed to copy share link", error);
      alert("Copy failed. Please copy manually.");
    }
  };

  const shareBouquetLink = async () => {
    if (!shareUrl) return;
    const sharePayload = {
      title: "Petals and Words Bouquet",
      text: `${senderName.trim() || "Someone special"} sent you a bouquet`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }
    } catch (error) {
      // User cancellation should not show fallback alerts.
      if (error?.name === "AbortError") return;
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${sharePayload.text} ${shareUrl}`)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (!hasBouquetData) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-8">
        <section className="w-full rounded-[2rem] border border-rose-200/70 bg-white/80 p-6 shadow-2xl shadow-rose-200/40 backdrop-blur sm:p-8">
          <h1 className="text-3xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            No bouquet data found
          </h1>
          <p className="mt-3 text-sm text-stone-600">Create a bouquet first, then continue to plans.</p>
          <Link to="/create" className="mt-5 inline-block rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700">
            Back to Builder
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:py-10">
      <section className="rounded-[2rem] border border-rose-200/70 bg-white/80 p-5 shadow-2xl shadow-rose-200/40 backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Choose A Plan</p>
        <h1 className="mt-2 text-4xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Keep this bouquet your way
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          Your bouquet currently has {flowerCount} flowers and {wordCount} words. Choose a bundle that keeps everything you created.
        </p>

        <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/70 p-3 text-sm text-rose-900">
          {requiredPlanId === "free" && <p>You are still within Free preview. You can unlock for cleaner delivery when you are ready.</p>}
          {requiredPlanId !== "free" && (
            <p>
              You went beyond Free preview. To keep every detail, choose at least <span className="font-semibold">{requiredPlan.name}</span>.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            const isTooSmall = PLAN_ORDER.indexOf(plan.id) < PLAN_ORDER.indexOf(requiredPlanId);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={[
                  "rounded-3xl border p-4 text-left transition",
                  isSelected ? "border-rose-500 bg-rose-50 shadow-md shadow-rose-200/50" : "border-stone-200 bg-white hover:border-rose-300",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                      {plan.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {plan.originalPriceLabel && <p className="text-xs text-stone-400 line-through">{plan.originalPriceLabel}</p>}
                      <p className="text-sm font-semibold text-rose-700">{plan.priceLabel}</p>
                    </div>
                  </div>
                  {plan.recommended && (
                    <span className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Popular</span>
                  )}
                </div>
                <p className="mt-3 text-xs text-stone-600">
                  Up to {plan.flowerLimit === Infinity ? "unlimited" : plan.flowerLimit} flowers, up to{" "}
                  {plan.wordLimit === Infinity ? "unlimited" : plan.wordLimit} words
                </p>
                <ul className="mt-3 space-y-1 text-xs text-stone-700">
                  {plan.features.map((feature) => (
                    <li key={feature}>* {feature}</li>
                  ))}
                </ul>
                {isTooSmall && <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">Won't keep everything</p>}
              </button>
            );
          })}
        </div>

        {selectedPlanId !== "free" && (
          <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/40 p-4">
            <label htmlFor="sender-name" className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">
              Your name (shown to receiver)
            </label>
            <input
              id="sender-name"
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Your name"
              className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        )}

        {!(selectedPlan.priceValue > 0 && hasPaidSuccessfully) && (
          <button
            type="button"
            disabled={!canKeepEverything || isProcessingPayment}
            className={[
              "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition",
              canKeepEverything && !isProcessingPayment
                ? "bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600"
                : "cursor-not-allowed bg-stone-200 text-stone-500",
            ].join(" ")}
            onClick={completeCheckout}
          >
            {isProcessingPayment && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {isProcessingPayment ? "Processing..." : selectedPlan.priceValue > 0 ? `Pay ${selectedPlan.priceLabel}` : "Continue Free"}
          </button>
        )}

        {!canKeepEverything && (
          <p className="mt-2 text-xs text-amber-700">Choose {requiredPlan.name} or above to keep every flower and word you added.</p>
        )}

        {checkoutMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">{checkoutMessage}</p>
          </div>
        )}

        {shareUrl && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">Share this link with your person:</p>
            <button
              type="button"
              onClick={shareBouquetLink}
              className="mt-2 break-all text-left text-sm text-emerald-900 underline decoration-emerald-300 underline-offset-2"
            >
              {shareUrl}
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={shareBouquetLink}
                className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Share Now
              </button>
              <button
                type="button"
                onClick={copyShareLink}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300"
          >
            Back
          </button>
          <Link to="/" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300">
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
