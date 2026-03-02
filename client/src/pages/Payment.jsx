import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { doc, setDoc } from "firebase/firestore";
import RecipientBouquetCanvas from "../components/RecipientBouquetCanvas";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { trackEvent } from "../lib/analytics";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";

const PLAN_ORDER = ["small", "medium"];
const SUPPORT_WHATSAPP_NUMBER = import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER || "";
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@petalsandwords.com";

const PLANS = [
  {
    id: "small",
    name: "Keep It Simple",
    subtitle: "Small",
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
    name: "Say More, Bloom More",
    subtitle: "Unlimited",
    priceLabel: "Rs 59",
    priceValue: 59,
    flowerLimit: Infinity,
    wordLimit: Infinity,
    features: ["No watermark", "Shareable link", "Unlimited flowers and words"],
  },
];

function countWords(text) {
  const normalized = text.trim();
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

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const stems = location.state?.stems ?? [];
  const note = location.state?.note ?? "";

  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const hasBouquetData = flowerCount > 0 || wordCount > 0;
  const isWithinSmallLimits = flowerCount <= 5 && wordCount <= 60;

  const requiredPlanId = useMemo(() => getRequiredPlan(flowerCount, wordCount), [flowerCount, wordCount]);
  const [selectedPlanId, setSelectedPlanId] = useState(requiredPlanId);
  const [senderName, setSenderName] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [shareUrl, setShareUrl] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasPaidSuccessfully, setHasPaidSuccessfully] = useState(false);

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const selectedPlan = PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[0];
  const canKeepEverything = PLAN_ORDER.indexOf(selectedPlanId) >= PLAN_ORDER.indexOf(requiredPlanId);
  const supportWhatsappHref = SUPPORT_WHATSAPP_NUMBER
    ? `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I need help with bouquet payment")}`
    : null;
  const leaveConfirmationMessage = "Are you sure you want to leave checkout? Your current payment progress may be lost.";

  useEffect(() => {
    applySeo({
      title: "Bouquet Plans and Checkout",
      description:
        "Select a bouquet plan to keep all flowers and note words, then generate a share link after checkout.",
      keywords: seoKeywords.payment,
      path: "/payment",
      robots: "noindex,nofollow",
    });

    trackCheckoutEvent("checkout_page_view", {
      flowerCount,
      wordCount,
      requiredPlanId,
    });
  }, [flowerCount, requiredPlanId, wordCount]);

  useEffect(() => {
    if (hasPaidSuccessfully) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handlePopState = () => {
      const confirmed = window.confirm(leaveConfirmationMessage);
      if (confirmed) {
        trackCheckoutEvent("payment_drop", { reason: "browser_back_confirmed" });
        window.removeEventListener("popstate", handlePopState);
        navigate(-1);
        return;
      }
      trackCheckoutEvent("payment_drop", { reason: "browser_back_cancelled" });
      window.history.pushState({ checkoutGuard: true }, "", window.location.href);
    };

    window.history.pushState({ checkoutGuard: true }, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasPaidSuccessfully, leaveConfirmationMessage, navigate]);

  const tryLeaveCheckout = () => {
    if (hasPaidSuccessfully || window.confirm(leaveConfirmationMessage)) {
      trackCheckoutEvent("payment_drop", { reason: "leave_button_confirmed" });
      navigate(-1);
    }
  };

  const tryGoHome = () => {
    if (hasPaidSuccessfully || window.confirm(leaveConfirmationMessage)) {
      trackCheckoutEvent("payment_drop", { reason: "home_button_confirmed" });
      navigate("/");
    }
  };

  const selectPlan = (planId) => {
    setSelectedPlanId(planId);
    const nextPlan = PLANS.find((plan) => plan.id === planId);
    trackCheckoutEvent("checkout_plan_selected", {
      selectedPlanId: planId,
      amountInr: nextPlan?.priceValue ?? 0,
    });
  };

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
      trackCheckoutEvent("checkout_share_link_save_failed", { selectedPlanId });
      alert("Unable to save share data.");
      return false;
    }

    const url = `${window.location.origin}/view/${id}`;
    setShareUrl(url);
    setCheckoutMessage("Payment successful. Your bouquet is now ready to share.");
    setHasPaidSuccessfully(true);

    trackCheckoutEvent("payment_success", {
      selectedPlanId,
      amountInr: selectedPlan.priceValue,
      flowerCount,
      wordCount,
      hasSenderName: Boolean(senderName.trim()),
      hasSenderEmail: false,
    });

    return true;
  };

  const completeCheckout = async () => {
    if (!canKeepEverything || isProcessingPayment) return;
    if (!senderName.trim()) {
      setCheckoutMessage("Please enter your name before payment.");
      return;
    }

    setCheckoutMessage("");
    setIsProcessingPayment(true);

    if (!razorpayKeyId) {
      setCheckoutMessage("Razorpay is not configured. Add VITE_RAZORPAY_KEY_ID in client/.env.");
      setIsProcessingPayment(false);
      trackCheckoutEvent("checkout_config_missing", { missing: "VITE_RAZORPAY_KEY_ID" });
      return;
    }

    const razorpayReady = await loadRazorpayScript();
    if (!razorpayReady || !window.Razorpay) {
      setCheckoutMessage("Unable to load payment gateway. Please try again.");
      setIsProcessingPayment(false);
      trackCheckoutEvent("checkout_gateway_load_failed", { selectedPlanId });
      return;
    }

    trackCheckoutEvent("payment_attempt", {
      selectedPlanId,
      amountInr: selectedPlan.priceValue,
      flowerCount,
      wordCount,
      hasSenderName: Boolean(senderName.trim()),
      hasSenderEmail: false,
    });

    const options = {
      key: razorpayKeyId,
      amount: Math.round(selectedPlan.priceValue * 100),
      currency: "INR",
      name: "Petals and Words",
      description: `${selectedPlan.subtitle} plan`,
      prefill: {
        name: senderName.trim(),
      },
      notes: {
        flowerCount: String(flowerCount),
        wordCount: String(wordCount),
        selectedPlanId,
      },
      theme: { color: "#f43f5e" },
      handler: async (response) => {
        const success = await createShareLink({
          provider: "razorpay",
          razorpay_payment_id: response?.razorpay_payment_id || "",
        });
        if (!success) setCheckoutMessage("Payment was captured, but saving your link failed. Please contact support.");
        setIsProcessingPayment(false);
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          trackCheckoutEvent("payment_drop", { reason: "payment_modal_dismissed" });
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        setCheckoutMessage("Payment did not complete. Please try again with UPI/card.");
        setIsProcessingPayment(false);
        trackCheckoutEvent("payment_failed", {
          selectedPlanId,
          amountInr: selectedPlan.priceValue,
          code: response?.error?.code || "unknown",
          reason: response?.error?.reason || "unknown",
          source: response?.error?.source || "unknown",
          step: response?.error?.step || "unknown",
        });
      });
      razorpay.open();
    } catch (error) {
      console.error("Unable to open Razorpay checkout", error);
      setCheckoutMessage("Unable to start payment right now. Please try again.");
      setIsProcessingPayment(false);
      trackCheckoutEvent("checkout_open_failed", { selectedPlanId });
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

  const stickyDisabled = !senderName.trim() || !canKeepEverything || isProcessingPayment;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6 pb-28 sm:py-10">
      <section className="rounded-[2rem] border border-rose-200/70 bg-white/85 p-5 shadow-2xl shadow-rose-200/40 backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Secure Checkout</p>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
          <button
            type="button"
            onClick={() => {
              const next = !isPreviewOpen;
              setIsPreviewOpen(next);
              if (next) trackCheckoutEvent("checkout_preview_opened", { step: "single_page" });
            }}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
          >
            {isPreviewOpen ? "Hide Bouquet Preview" : "Show Bouquet Preview"}
          </button>
          {isPreviewOpen && (
            <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-3">
              <div className="relative mx-auto w-full max-w-[360px] pb-20">
                <div className="flex justify-center">
                  <RecipientBouquetCanvas stems={stems} />
                </div>
                {note.trim() && (
                  <div
                    className="absolute -bottom-4 right-0 w-[72%] rounded-2xl border border-amber-200/80 p-3 text-stone-800 shadow-[0_18px_28px_rgba(60,35,10,0.25)]"
                    style={{
                      transform: "rotate(-7deg)",
                      backgroundColor: "#f4ecd6",
                      backgroundImage: "url('/note-paper-texture.svg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <span className="absolute -top-3 left-8 h-7 w-px bg-amber-900/45" aria-hidden="true" />
                    <span className="absolute -top-2 left-7 h-2.5 w-2.5 rounded-full bg-amber-900/70 shadow" aria-hidden="true" />
                    <p className="text-sm leading-relaxed text-stone-800">
                      {note.length > 120 ? `${note.slice(0, 120)}...` : note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
          <label htmlFor="sender-name" className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-700">
            Your name
          </label>
          <input
            id="sender-name"
            type="text"
            value={senderName}
            onChange={(event) => setSenderName(event.target.value)}
            placeholder="Enter your name"
            className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm font-semibold text-stone-900">Choose how you want to send this bouquet</p>
          {isWithinSmallLimits ? (
            <p className="mt-1 text-sm text-stone-600">This one is simple and sweet. Add more flowers, say more, or keep it minimal.</p>
          ) : (
            <p className="mt-1 text-sm text-stone-600">This bouquet is fuller. Unlimited will preserve every detail exactly.</p>
          )}

          <div className="mt-3 space-y-2">
            {PLANS.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const isTooSmall = PLAN_ORDER.indexOf(plan.id) < PLAN_ORDER.indexOf(requiredPlanId);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => selectPlan(plan.id)}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    isSelected ? "border-rose-500 bg-rose-50/40 shadow-sm" : "border-stone-200 bg-white hover:border-rose-300",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-stone-900">{plan.name}</p>
                      <p className="text-sm text-stone-600">{plan.subtitle}</p>
                    </div>
                    <div className="text-right">
                      {plan.originalPriceLabel && <p className="text-xs text-stone-400 line-through">{plan.originalPriceLabel}</p>}
                      <p className="text-base font-semibold text-rose-700">{plan.priceLabel}</p>
                      <p className={isSelected ? "text-xs font-semibold text-rose-600" : "text-xs text-stone-400"}>{isSelected ? "Selected" : "Choose"}</p>
                    </div>
                  </div>
                  {plan.id === "small" && flowerCount > 5 && (
                    <p className="mt-2 text-xs font-semibold text-amber-700">This bouquet has more than 5 flowers. Keep It Simple will trim extra flowers.</p>
                  )}
                  {isTooSmall && plan.id !== "small" && <p className="mt-2 text-xs font-semibold text-amber-700">This will trim bouquet details.</p>}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={stickyDisabled}
          className={[
            "mt-4 hidden w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition sm:block",
            stickyDisabled ? "cursor-not-allowed bg-stone-200 text-stone-500" : "bg-rose-500 text-white hover:bg-rose-600",
          ].join(" ")}
          onClick={completeCheckout}
        >
          {isProcessingPayment ? "Processing..." : `Pay ${selectedPlan.priceLabel} Securely`}
        </button>

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

        <div className="mt-4 rounded-2xl border border-stone-200 bg-white/70 p-3 text-xs text-stone-700">
          <p className="font-semibold text-stone-800">Support</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {supportWhatsappHref && (
              <a href={supportWhatsappHref} target="_blank" rel="noreferrer" className="underline decoration-stone-300 underline-offset-2">
                WhatsApp support
              </a>
            )}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline decoration-stone-300 underline-offset-2">
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={tryLeaveCheckout}
            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={tryGoHome}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300"
          >
            Home
          </button>
        </div>
      </section>

      {!hasPaidSuccessfully && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
          <button
            type="button"
            disabled={stickyDisabled}
            onClick={completeCheckout}
            className={[
              "w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition",
              stickyDisabled ? "cursor-not-allowed bg-stone-200 text-stone-500" : "bg-rose-500 text-white",
            ].join(" ")}
          >
            {isProcessingPayment ? "Processing..." : `Pay ${selectedPlan.priceLabel}`}
          </button>
        </div>
      )}
    </main>
  );
}
