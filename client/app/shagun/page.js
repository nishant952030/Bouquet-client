"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { loadRazorpayScript } from "../../src/lib/razorpay";
import LanguageSwitcher from "../../src/components/LanguageSwitcher";

// Theme configuration
const THEMES = {
  wedding: {
    id: "wedding",
    name: "Royal Wedding (Shagun)",
    primary: "#c5a880", // Gold
    bg: "#fffdf9",
    border: "#f3ebd9",
    text: "#5c4933",
    banner: "linear-gradient(135deg, #8b0000 0%, #b22222 100%)", // Shaadi Red
    emoji: "🌸",
    icon: "💍",
    accent: "#b22222",
  },
  eid: {
    id: "eid",
    name: "Festive Eid (Eidi)",
    primary: "#10b981", // Emerald Green
    bg: "#f4fcf7",
    border: "#d1fae5",
    text: "#065f46",
    banner: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
    emoji: "🌙",
    icon: "🕌",
    accent: "#065f46",
  },
  diwali: {
    id: "diwali",
    name: "Auspicious Diwali",
    primary: "#f59e0b", // Warm Yellow/Orange
    bg: "#fffaf0",
    border: "#fef3c7",
    text: "#78350f",
    banner: "linear-gradient(135deg, #b91c1c 0%, #d97706 100%)",
    emoji: "🪔",
    icon: "🔥",
    accent: "#b91c1c",
  },
  birthday: {
    id: "birthday",
    name: "Celebration Cash",
    primary: "#8b5cf6", // Purple
    bg: "#faf5ff",
    border: "#ede9fe",
    text: "#5b21b6",
    banner: "linear-gradient(135deg, #6d28d9 0%, #db2777 100%)",
    emoji: "🎉",
    icon: "🎂",
    accent: "#6d28d9",
  },
};

const SHAGUN_PRESETS = [101, 251, 501, 1001, 2001, 5001];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  .shagun-root {
    font-family: 'Outfit', sans-serif;
    background: #fdfbf7;
    color: #2d251e;
    min-height: 100vh;
  }
  
  .shagun-header {
    background: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(228, 141, 156, 0.15);
  }

  .font-serif-playfair {
    font-family: 'Playfair Display', serif;
  }

  .theme-btn {
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .theme-btn.active {
    border-color: var(--theme-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .preset-btn {
    border: 1.5px solid #e7dfd5;
    background: #ffffff;
    transition: all 0.2s ease;
  }

  .preset-btn:hover {
    border-color: #c5a880;
    background: #fffdf9;
  }

  .preset-btn.active {
    background: #7c4343;
    color: #ffffff;
    border-color: #7c4343;
    box-shadow: 0 4px 10px rgba(124, 67, 67, 0.25);
  }

  /* Envelope Popping Animation */
  .envelope-container {
    perspective: 1000px;
  }

  .card-preview {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  }

  .card-preview:hover {
    transform: translateY(-8px) rotate(1deg);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }

  .shagun-cta {
    background: linear-gradient(135deg, #7c4343 0%, #5c2d2d 100%);
    box-shadow: 0 8px 24px rgba(124, 67, 67, 0.25);
    transition: all 0.2s ease;
  }

  .shagun-cta:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124, 67, 67, 0.35);
  }

  .shagun-cta:active:not(:disabled) {
    transform: scale(0.98);
  }

  @keyframes shimmer-gold {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .gold-shimmer-text {
    background: linear-gradient(90deg, #8a6f43 0%, #c5a880 40%, #e8d7bb 70%, #8a6f43 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-gold 4s linear infinite;
  }
`;

export default function CreateShagun() {
  const router = useRouter();
  const { t } = useTranslation();

  const [activeThemeId, setActiveThemeId] = useState("wedding");
  const activeTheme = THEMES[activeThemeId];

  // Form states
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState(501);
  const [message, setMessage] = useState("");
  
  // Custom amount mode vs Presets
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmountText, setCustomAmountText] = useState("");

  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const platformFee = 15;
  const totalAmount = Number(amount) + platformFee;

  const handlePresetSelect = (val) => {
    setIsCustomAmount(false);
    setAmount(val);
    setErrorMsg("");
  };

  const handleCustomAmountChange = (e) => {
    const valStr = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmountText(valStr);
    const valNum = Number(valStr);
    setAmount(valNum);
    
    if (valStr && valNum < 10) {
      setErrorMsg("Minimum gift amount is ₹10");
    } else if (valNum > 50000) {
      setErrorMsg("Maximum gift amount is ₹50,000");
    } else {
      setErrorMsg("");
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!senderName.trim()) {
      setErrorMsg("Please enter your name (Sender Name)");
      return;
    }
    if (amount < 10) {
      setErrorMsg("Minimum gift amount is ₹10");
      return;
    }
    if (amount > 50000) {
      setErrorMsg("Maximum gift amount is ₹50,000");
      return;
    }

    setIsPaying(true);
    setErrorMsg("");

    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout script. Check your internet connection.");
      }

      // 2. Create Razorpay order on our server
      const response = await fetch("/api/shagun/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          receiverName,
          amount,
          message: message || `Best Wishes on this auspicious occasion!`,
          theme: activeThemeId,
        }),
      });

      const orderData = await response.json();
      if (!response.ok || !orderData?.orderId) {
        throw new Error(orderData?.error || "Failed to create order on payment gateway");
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_somekey"; // Next.js env compatible

      // 3. Trigger Razorpay Checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Petals & Words Shagun",
        description: `Digital Shagun Envelope for ₹${amount}`,
        order_id: orderData.orderId,
        theme: { color: activeTheme.accent },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            setErrorMsg("Payment cancelled by user. Complete payment to generate card.");
          },
        },
        handler: async (paymentResponse) => {
          try {
            // 4. Verify payment on server
            const verifyRes = await fetch("/api/shagun/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentResponse,
                shagunId: orderData.shagunId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.ok) {
              router.push(`/shagun/success/${orderData.shagunId}`);
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (verErr) {
            console.error("Payment verification failure:", verErr);
            setErrorMsg(`Verification failed: ${verErr.message}. If funds were debited, contact support.`);
            setIsPaying(false);
          }
        },
      });

      rzp.on("payment.failed", (failedRes) => {
        console.error("Payment failed:", failedRes.error);
        setErrorMsg(`Payment failed: ${failedRes.error.description}`);
        setIsPaying(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout launch error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setIsPaying(false);
    }
  };

  return (
    <div className="shagun-root min-h-screen flex flex-col pb-16">
      <style>{CSS}</style>

      {/* Header */}
      <header className="shagun-header sticky top-0 z-30 w-full">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-decoration-none">
            <img src="/logo-transparent.png" alt="Petals & Words" className="h-8 md:h-9" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-[#7c4343] hover:opacity-80 text-decoration-none">
              {t("common.home", "Home")}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Title & Introduction */}
      <main className="max-w-6xl mx-auto px-4 mt-8 flex-grow">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#a65d5d] bg-[#fff0f1] px-3 py-1 rounded-full">
            🎁 Digital Envelope Gifting
          </span>
          <h1 className="font-serif-playfair text-4xl md:text-5xl font-bold mt-3 mb-4 text-[#3d3028] leading-tight">
            Digitize your Cash Gifting <br />
            <em className="gold-shimmer-text italic font-medium">with a physical touch</em>
          </h1>
          <p className="max-w-xl mx-auto text-[#705f58] text-sm md:text-base leading-relaxed">
            Create a custom digital envelope, pay securely, and print a beautiful voucher insert with a QR code. 
            Slip it into a traditional physical envelope. Receivers scan and claim directly to their UPI!
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#ede9e2]">
            <form onSubmit={handlePay} className="flex flex-col gap-6">
              
              {/* Step 1: Choose Theme */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#7c4343] block mb-3">
                  Step 1: Choose Greeting Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.values(THEMES).map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setActiveThemeId(theme.id)}
                      className={`theme-btn p-3 rounded-2xl bg-white border border-solid border-[#ede9e2] text-left flex flex-col justify-between h-24 cursor-pointer active:scale-95 ${
                        activeThemeId === theme.id ? "active" : ""
                      }`}
                      style={{ "--theme-primary": theme.primary }}
                    >
                      <span className="text-2xl">{theme.icon}</span>
                      <span className="text-xs font-bold text-[#3d3028] mt-2 block leading-snug">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Gifting Details */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#7c4343] block mb-1">
                  Step 2: Envelope Details
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-[#5c4a40]">Sender's Name *</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aunt Kavita & Uncle Rajesh"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="p-3.5 rounded-xl border border-solid border-[#e7dfd5] outline-none text-sm focus:border-[#7c4343] transition-colors"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-[#5c4a40]">Receiver's Name (Optional)</span>
                    <input
                      type="text"
                      placeholder="e.g. Rohan & Riya"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="p-3.5 rounded-xl border border-solid border-[#e7dfd5] outline-none text-sm focus:border-[#7c4343] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#5c4a40]">Auspicious Gift Amount (INR)</span>
                  
                  {/* Preset Buttons */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SHAGUN_PRESETS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handlePresetSelect(val)}
                        className={`preset-btn py-2.5 rounded-xl font-bold text-sm cursor-pointer ${
                          !isCustomAmount && amount === val ? "active" : ""
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>

                  {/* Auspicious note */}
                  <p className="text-[11px] text-[#8a725e] italic">
                    💡 Traditional Shagun amounts end in ₹1 (e.g. ₹501, ₹1001) as a symbol of prosperity and continuation.
                  </p>

                  {/* Custom Amount Field */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomAmount(true);
                        setAmount(customAmountText ? Number(customAmountText) : 10);
                        setErrorMsg("");
                      }}
                      className={`text-xs font-semibold underline cursor-pointer hover:text-[#7c4343] ${
                        isCustomAmount ? "text-[#7c4343] font-bold" : "text-[#8a725e]"
                      }`}
                    >
                      {isCustomAmount ? "✓ Editing Custom Amount" : "Or enter custom amount..."}
                    </button>
                    {isCustomAmount && (
                      <div className="relative mt-2 max-w-xs">
                        <span className="absolute left-3.5 top-3.5 text-sm font-bold text-[#8a725e]">₹</span>
                        <input
                          type="text"
                          placeholder="e.g. 5000"
                          value={customAmountText}
                          onChange={handleCustomAmountChange}
                          className="p-3.5 pl-8 w-full rounded-xl border border-solid border-[#e7dfd5] outline-none text-sm font-bold focus:border-[#7c4343]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#5c4a40]">Personal Message</span>
                  <textarea
                    rows={3}
                    placeholder="Wishing you both a lifetime of happiness, love, and laughter!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={200}
                    className="p-3.5 rounded-xl border border-solid border-[#e7dfd5] outline-none text-sm focus:border-[#7c4343] transition-colors resize-none"
                  />
                  <span className="text-[10px] text-[#9e8f80] text-right">
                    {message.length}/200 characters
                  </span>
                </div>
              </div>

              {/* Step 3: Checkout Summary */}
              <div className="border-t border-solid border-[#f0ebe3] pt-6 flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#7c4343]">
                  Payment Summary
                </h3>
                <div className="flex flex-col gap-2 bg-[#faf8f4] p-4 rounded-2xl border border-solid border-[#f0ebe3]">
                  <div className="flex justify-between text-sm text-[#5c4a40]">
                    <span>Gift Value (transfer to recipient):</span>
                    <span className="font-bold">₹{amount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#5c4a40]">
                    <span>Platform & Secure Transfer Fee:</span>
                    <span className="font-bold">₹{platformFee}</span>
                  </div>
                  <hr className="border-t border-[#f0ebe3] my-1" />
                  <div className="flex justify-between text-base font-bold text-[#3d3028]">
                    <span>Total Amount to Pay:</span>
                    <span className="text-lg text-[#7c4343]">₹{totalAmount || 0}</span>
                  </div>
                </div>
                
                {errorMsg && (
                  <div className="bg-[#fdf2f2] text-[#991b1b] p-3 rounded-xl text-xs font-semibold border border-solid border-[#fee2e2]">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPaying || !senderName.trim() || amount < 10}
                  className="shagun-cta w-full text-white text-sm font-bold uppercase tracking-wider py-4 rounded-full border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-solid border-white/50 border-t-white rounded-full animate-spin" />
                      Initializing Secure Payment...
                    </>
                  ) : (
                    `Pay ₹${totalAmount} & Create Gift Envelope 🔒`
                  )}
                </button>

                <div className="text-center text-[11px] text-[#a6958a] mt-1 leading-snug">
                  🛡️ Secure checkout via **Razorpay**. Funds are locked and routed securely to receivers via automated payout protocols. The platform holds 0 funds.
                </div>
              </div>
            </form>
          </div>

          {/* Live Preview Card Side */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col items-center gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8a725e]">
              ✨ Envelope Insert Card Preview
            </span>

            {/* Tactile envelope layout */}
            <div className="envelope-container w-full max-w-[340px]">
              
              {/* Card Insert Design */}
              <div
                className="card-preview w-full rounded-2xl shadow-lg border border-solid overflow-hidden relative"
                style={{
                  background: activeTheme.bg,
                  borderColor: activeTheme.border,
                  minHeight: "360px",
                }}
              >
                {/* Header Banner */}
                <div
                  className="h-12 w-full flex items-center justify-between px-4 text-white font-bold"
                  style={{ background: activeTheme.banner }}
                >
                  <span className="text-sm tracking-wide">SHAGUN ENVELOPE</span>
                  <span className="text-xl leading-none">{activeTheme.emoji}</span>
                </div>

                {/* Card Inner Content */}
                <div className="p-5 flex flex-col items-center justify-between min-h-[300px] text-center gap-6">
                  
                  {/* Decorative Elements */}
                  <div style={{ color: activeTheme.accent, opacity: 0.15 }} className="w-12 h-12">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 19.5c-4.14 0-7.5-3.36-7.5-7.5s3.36-7.5 7.5-7.5 7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zM11.25 8.25h1.5v4.5h-1.5v-4.5zm0 6h1.5v1.5h-1.5v-1.5z"/></svg>
                  </div>

                  <div>
                    {receiverName.trim() && (
                      <p className="text-xs uppercase tracking-wider text-[#a6958a] font-bold mb-1">
                        For: {receiverName.trim()}
                      </p>
                    )}
                    <h3 className="font-serif-playfair text-2xl font-bold text-[#3d3028]" style={{ color: activeTheme.text }}>
                      A Gift of ₹{amount || "—"}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-[#a6958a] font-bold mt-1">
                      From: {senderName.trim() || "Sender Name"}
                    </p>
                  </div>

                  {/* Message preview */}
                  <div className="bg-[#ffffff]/80 p-3 rounded-xl border border-dashed border-[#ede9e2] max-w-[260px]">
                    <p className="text-xs italic text-[#5c4a40] line-clamp-3 leading-relaxed">
                      "{message.trim() || "Wishing you both a lifetime of happiness, love, and laughter!"}"
                    </p>
                  </div>

                  {/* QR Placeholder */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 bg-white rounded-xl border border-solid border-[#ede9e2] p-1.5 flex items-center justify-center shadow-inner relative overflow-hidden">
                      {/* Stylized QR placeholder illustration */}
                      <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#e0d7c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="6" height="6" rx="1" />
                        <rect x="15" y="3" width="6" height="6" rx="1" />
                        <rect x="3" y="15" width="6" height="6" rx="1" />
                        <path d="M16 16h2v2h-2zm-3-3h3v3h-3zm3 0h2v2h-2zm-5 5v-3h2M9 16h2m-2-3h3" />
                      </svg>
                      {/* Security stamp */}
                      <div className="absolute inset-0 bg-[#fffdf9]/75 flex items-center justify-center">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7c4343] transform rotate-12 bg-white/90 border border-solid border-[#7c4343] px-2 py-0.5 rounded shadow-sm">
                          QR SECURED
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#9e8f80] uppercase tracking-wider font-semibold">
                      Scan to receive via UPI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="bg-[#fff9f3] p-5 rounded-2xl border border-solid border-[#fbf3e5] text-left max-w-[340px]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7c4343] mb-2">
                📬 Physical Presentation Note:
              </h4>
              <p className="text-xs text-[#5c4a40] leading-relaxed">
                Once paid, you will get the final image of this card with the active QR code. Print it on a color printer, fold/cut along the border, and place it into a traditional gold/red shagun envelope.
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
