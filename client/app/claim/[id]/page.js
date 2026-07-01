"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { db, isFirebaseConfigured } from "../../../src/lib/firebase";
import LanguageSwitcher from "../../../src/components/LanguageSwitcher";

const THEME_STYLES = {
  wedding: {
    name: "Royal Wedding",
    bg: "linear-gradient(135deg, #fffcf6 0%, #fff7e6 100%)",
    border: "#f3ebd9",
    text: "#5c4933",
    banner: "linear-gradient(135deg, #8b0000 0%, #b22222 100%)",
    emoji: "🌸",
    accent: "#b22222",
  },
  eid: {
    name: "Festive Eid",
    bg: "linear-gradient(135deg, #f3fbf6 0%, #e6f7ec 100%)",
    border: "#d1fae5",
    text: "#065f46",
    banner: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
    emoji: "🌙",
    accent: "#065f46",
  },
  diwali: {
    name: "Auspicious Diwali",
    bg: "linear-gradient(135deg, #fffaf0 0%, #fff3c7 100%)",
    border: "#fef3c7",
    text: "#78350f",
    banner: "linear-gradient(135deg, #b91c1c 0%, #d97706 100%)",
    emoji: "🪔",
    accent: "#b91c1c",
  },
  birthday: {
    name: "Celebration Cash",
    bg: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)",
    border: "#ede9fe",
    text: "#5b21b6",
    banner: "linear-gradient(135deg, #6d28d9 0%, #db2777 100%)",
    emoji: "🎉",
    accent: "#6d28d9",
  },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  .claim-root {
    font-family: 'Outfit', sans-serif;
    background: #fdfbf7;
    color: #2d251e;
    min-height: 100vh;
  }

  .font-serif-playfair {
    font-family: 'Playfair Display', serif;
  }

  .claim-card {
    background: #ffffff;
    box-shadow: 0 12px 40px rgba(124, 67, 67, 0.06);
    border: 1px solid rgba(228, 141, 156, 0.15);
  }

  .trust-badge {
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
  }

  /* Confetti animations */
  .confetti-container {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none;
    z-index: 99;
    overflow: hidden;
  }

  .confetti-piece {
    position: absolute;
    width: 10px; height: 10px;
    background: #ffd700;
    opacity: 0;
    animation: confettiFall 4s ease-out infinite;
  }

  @keyframes confettiFall {
    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
  }

  .pulse-avatar {
    animation: avPulse 2s infinite ease-in-out;
  }

  @keyframes avPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

export default function ClaimShagun() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Claim Form states
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Validation UI states
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [vpaVerified, setVpaVerified] = useState(false);
  const [vpaError, setVpaError] = useState("");

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [disclaimerError, setDisclaimerError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    const fetchDetails = async () => {
      if (!id) {
        setFetchError(true);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/shagun/get?id=${id}`);
        if (res.ok) {
          const shagunData = await res.json();
          if (!cancelled) {
            setData(shagunData);
            setIsLoading(false);
          }
          return;
        }

        // Fallback to local storage (for testing offline flow)
        const localRaw = localStorage.getItem(`shagun_share_${id}`);
        if (localRaw) {
          const localData = JSON.parse(localRaw);
          if (!cancelled) {
            setData(localData);
            setIsLoading(false);
          }
        } else {
          if (!cancelled) {
            setFetchError(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching Shagun card details:", err);
        if (!cancelled) {
          setFetchError(true);
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
    return () => { cancelled = true; };
  }, [id]);

  // Audio chimes setup (Shehnai/Chimes celebration on success)
  const playClaimMelody = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const notes = [
        { f: 587.33, d: 0.15 }, // D5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 880.00, d: 0.15 }, // A5
        { f: 987.77, d: 0.35 }, // B5
        { f: 880.00, d: 0.15 }, // A5
        { f: 987.77, d: 0.50 }  // B5 (Holds)
      ];

      let delay = 0;
      notes.forEach((note) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "triangle"; // Gives a soft woodwind Shehnai feel
          osc.frequency.setValueAtTime(note.f, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.01, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.d - 0.01);
          
          osc.start();
          osc.stop(ctx.currentTime + note.d);
        }, delay * 1000);
        delay += note.d + 0.02;
      });
    } catch (e) {
      console.warn("Audio Context blocked or failed to initialize:", e);
    }
  };

  const handleVerifyUpi = async () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      setVpaError("Please enter a valid UPI VPA ID (e.g. name@okhdfcbank)");
      return;
    }
    setVpaError("");
    setIsVerifyingUpi(true);
    setVpaVerified(false);

    try {
      const res = await fetch("/api/shagun/verify-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId: upiId.trim() }),
      });
      const verifyData = await res.json();
      
      if (res.ok && verifyData.success) {
        setUpiName(verifyData.name);
        setVpaVerified(true);
      } else {
        setVpaError(verifyData.error || "We couldn't verify this UPI ID. Please check and try again.");
      }
    } catch {
      setVpaError("Gateway timeout. You can still proceed with care.");
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!phone || phone.trim().length < 10) newErrors.phone = "Please enter a valid 10-digit phone number";
    if (!upiId.trim() || !upiId.includes("@")) newErrors.upiId = "Please enter a valid UPI ID (e.g. name@upi)";
    if (!upiName.trim()) newErrors.upiName = "Please enter your UPI account holder name as shown in your UPI app";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    if (!disclaimerAccepted) { setDisclaimerError("You must confirm the above before claiming"); return; }
    setDisclaimerError("");
    setIsClaiming(true);
    setClaimError("");
    try {
      const res = await fetch("/api/shagun/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shagunId: data.id,
          upiId: upiId.trim(),
          receiverName: upiName.trim(),
          upiName: upiName.trim(),
          phone: phone.trim(),
        }),
      });
      const claimData = await res.json();
      if (res.ok && claimData.success) {
        setClaimSuccess(true);
        playClaimMelody();
        setData(prev => ({
          ...prev,
          claimStatus: "payout_pending",
          receiverRealName: upiName.trim(),
          receiverUpiName: upiName.trim(),
          receiverUpi: upiId.trim(),
          receiverPhone: phone.trim(),
          claimedAt: new Date().toISOString(),
        }));
      } else {
        setClaimError(claimData.error || "Claim request failed. Please try again.");
      }
    } catch {
      setClaimError("Network error. Please check your connection and try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (fetchError) {
    return (
      <div className="claim-root flex items-center justify-center min-h-screen p-4">
        <style>{CSS}</style>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-solid border-[#ede9e2]">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="font-serif-playfair text-xl font-bold text-stone-800 mb-2">Invalid Gift Voucher</h2>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            We couldn't locate this shagun voucher. The QR code may be printed incorrectly or is missing in our system.
          </p>
          <Link href="/" className="inline-block bg-[#7c4343] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full no-underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="claim-root flex items-center justify-center min-h-screen">
        <style>{CSS}</style>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#7c4343] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-stone-600">Retrieving envelope gift card details...</p>
        </div>
      </div>
    );
  }

  const themeStyle = THEME_STYLES[data.theme] || THEME_STYLES.wedding;
  const isAlreadyClaimed = data.status === "claimed" || data.claimStatus === "claimed";
  const isPayoutPending = data.claimStatus === "payout_pending";
  const isAlreadyProcessed = isAlreadyClaimed || isPayoutPending;

  return (
    <div className="claim-root pb-24 flex flex-col items-center">
      <style>{CSS}</style>

      {/* Confetti Animation Layer */}
      {claimSuccess && (
        <div className="confetti-container">
          {Array.from({ length: 120 }).map((_, i) => {
            const delay = Math.random() * 4;
            const left = Math.random() * 100;
            const rot = Math.random() * 360;
            const colors = ["#ffd700", "#ff4d6d", "#4ea8de", "#52b788", "#db2777"];
            const color = colors[i % colors.length];
            return (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  background: color,
                  transform: `rotate(${rot}deg)`,
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-solid border-stone-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8" />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="w-full max-w-xl px-4 mt-8">
        
        {/* Envelope Layout Card */}
        <div
          className="claim-card rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          style={{ background: themeStyle.bg }}
        >
          {/* Header Banner */}
          <div
            className="h-16 w-full flex items-center justify-between px-6 text-white font-bold"
            style={{ background: themeStyle.banner }}
          >
            <span className="text-xs uppercase tracking-widest font-extrabold">Received Shagun Gift</span>
            <span className="text-3xl leading-none">{themeStyle.emoji}</span>
          </div>

          <div className="p-6 md:p-8 text-center flex flex-col gap-6">
            
            {/* Sender & Amount Header */}
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-400 font-extrabold mb-1">
                Auspicious Greeting Card
              </p>
              <h1 className="font-serif-playfair text-3xl md:text-4xl font-extrabold text-[#3d3028]" style={{ color: themeStyle.text }}>
                Shagun of ₹{data.amount}
              </h1>
              <p className="text-xs uppercase tracking-widest font-extrabold text-stone-500 mt-2">
                From: <span className="text-[#7c4343]">{data.senderName}</span>
              </p>
            </div>

            {/* Custom note */}
            <div className="bg-white/85 p-5 rounded-2xl border border-dashed border-[#ede9e2] max-w-md mx-auto w-full shadow-inner">
              <p className="text-sm italic text-[#5c4a40] leading-relaxed">
                "{data.message || "Wishing you both a lifetime of happiness, love, and laughter!"}"
              </p>
            </div>

            {/* ── STATE A: Claim completed successfully ── */}
            {isAlreadyClaimed && (
              <div className="bg-emerald-50 text-emerald-900 border border-solid border-emerald-200 p-5 rounded-2xl flex flex-col gap-3">
                <span className="text-3xl">🎉</span>
                <h3 className="font-bold text-sm">Shagun Transfer Completed!</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  ₹{data.amount} was successfully credited to <strong>{data.receiverRealName}</strong> via UPI ID <strong>{data.receiverUpi}</strong>.
                </p>
                <div className="text-[10px] text-stone-400 bg-white/70 p-2 rounded-lg border border-solid border-emerald-100 flex flex-col gap-1 text-left font-mono">
                  <div>Claimed At: {new Date(data.claimedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
                  {data.utr && <div className="text-emerald-600 font-bold">Bank UTR / Ref: {data.utr}</div>}
                </div>
              </div>
            )}

            {/* ── STATE B: Claim submitted, payout pending ── */}
            {(isPayoutPending || claimSuccess) && !isAlreadyClaimed && (
              <div className="bg-amber-50 text-amber-900 border border-solid border-amber-200 p-5 rounded-2xl flex flex-col gap-3">
                <span className="text-3xl">⏳</span>
                <h3 className="font-bold text-sm">Claim Submitted — Payout Processing!</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your claim for <strong>₹{data.amount}</strong> has been registered. Our team will manually verify your UPI details and transfer the funds within 10 minutes.
                </p>
                <div className="text-[10px] text-stone-500 bg-white/70 p-3 rounded-xl border border-solid border-amber-100 flex flex-col gap-1 text-left font-mono">
                  {(data.claimedAt || claimSuccess) && (
                    <div>Submitted: {data.claimedAt ? new Date(data.claimedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Just now"}</div>
                  )}
                  {(data.receiverUpi || upiId) && <div>UPI ID: {data.receiverUpi || upiId}</div>}
                  {(data.receiverUpiName || upiName) && <div>UPI Name: {data.receiverUpiName || upiName}</div>}
                  {(data.receiverPhone || phone) && <div>Phone: {data.receiverPhone || phone}</div>}
                </div>
                <span className="text-[10px] text-stone-500 font-semibold">
                  📱 You will receive an SMS confirmation once the bank transfer is completed.
                </span>
              </div>
            )}

            {/* ── STATE C: Active claim form ── */}
            {!isAlreadyProcessed && !claimSuccess && (
              <div className="flex flex-col gap-5 text-left border-t border-solid border-[#ede9e2] pt-5">
                
                {/* Trust Checklist Banner */}
                <div className="trust-badge p-4 rounded-2xl flex items-start gap-3">
                  <span className="text-xl">🛡️</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Safe Claim Checklist</span>
                    <ul className="text-[10.5px] text-emerald-900 pl-4 list-disc leading-relaxed">
                      <li><strong>NO PIN or Password</strong> is needed to receive money.</li>
                      <li>We will never ask you to link cards or pay a fee.</li>
                      <li>Double check your UPI address before clicking Claim.</li>
                    </ul>
                  </div>
                </div>

                <form onSubmit={handleSubmitClaim} className="flex flex-col gap-4">
                  
                  {/* Phone Input */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Your Phone Number *</span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      className="p-3.5 rounded-xl border border-solid border-stone-200 outline-none text-sm focus:border-[#7c4343] font-medium"
                    />
                    {errors.phone && <span className="text-[10px] font-bold text-[#b91c1c]">⚠️ {errors.phone}</span>}
                  </div>

                  {/* UPI VPA ID Input */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Your UPI VPA ID *</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. name@okaxis or 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value.trim());
                          setVpaVerified(false);
                          setUpiName("");
                        }}
                        className="p-3.5 rounded-xl border border-solid border-stone-200 outline-none text-sm font-semibold flex-grow"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyUpi}
                        disabled={isVerifyingUpi || !upiId}
                        className="px-4 bg-[#7c4343] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#5c2d2d] text-white text-xs font-bold uppercase tracking-wide rounded-xl border-none cursor-pointer flex-shrink-0 transition-colors"
                      >
                        {isVerifyingUpi ? "Verifying..." : "Verify ID"}
                      </button>
                    </div>
                    {vpaError && <span className="text-[10px] font-bold text-[#b91c1c]">⚠️ {vpaError}</span>}
                    {errors.upiId && <span className="text-[10px] font-bold text-[#b91c1c]">⚠️ {errors.upiId}</span>}
                  </div>

                  {/* Holder Name Input (Only shows once verified or editable if error) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">UPI Account Holder Name *</span>
                    <input
                      type="text"
                      required
                      placeholder="Verify UPI to populate or enter manually"
                      value={upiName}
                      onChange={(e) => setUpiName(e.target.value)}
                      className={`p-3.5 rounded-xl border border-solid outline-none text-sm font-bold ${
                        vpaVerified 
                          ? "bg-emerald-50/50 border-emerald-300 text-emerald-950" 
                          : "border-stone-200 focus:border-[#7c4343]"
                      }`}
                    />
                    {vpaVerified && (
                      <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
                        ✓ Verified UPI Holder: {upiName}
                      </span>
                    )}
                    {errors.upiName && <span className="text-[10px] font-bold text-[#b91c1c]">⚠️ {errors.upiName}</span>}
                  </div>

                  {/* Strict India Compliance Disclaimer */}
                  <div className="mt-2 bg-stone-50 p-4 rounded-xl border border-solid border-stone-200 flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="disclaimer-chk"
                      checked={disclaimerAccepted}
                      onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                      className="mt-1 cursor-pointer w-4 h-4 accent-[#7c4343]"
                    />
                    <label htmlFor="disclaimer-chk" className="text-[11px] text-stone-600 leading-normal select-none cursor-pointer">
                      I confirm that the UPI details provided are correct. I understand that since funds are processed dynamically via direct bank APIs, wrong entries cannot be recalled.
                    </label>
                  </div>
                  {disclaimerError && <span className="text-[10px] font-bold text-[#b91c1c]">⚠️ {disclaimerError}</span>}

                  {claimError && (
                    <div className="bg-[#fdf2f2] text-[#991b1b] p-3.5 rounded-xl text-xs font-bold border border-solid border-[#fee2e2]">
                      ⚠️ {claimError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isClaiming || !phone || !upiId || !upiName}
                    className="w-full text-white text-sm font-bold uppercase tracking-wider py-4 rounded-full border-none cursor-pointer flex items-center justify-center gap-2 shagun-cta disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isClaiming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-solid border-white/50 border-t-white rounded-full animate-spin" />
                        Initiating Direct Transfer...
                      </>
                    ) : (
                      `Claim ₹${data.amount} to Account 🔒`
                    )}
                  </button>

                </form>
              </div>
            )}

            {/* Bottom Footer logo */}
            <div className="border-t border-solid border-stone-200/50 pt-5 text-center">
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">
                ID: {data.id} • Securely processed via Razorpay API Node
              </span>
            </div>

          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/shagun" className="text-[11px] font-bold text-[#7c4343] hover:text-[#5c2d2d] no-underline">
            Want to send money in a gorgeous digital greeting envelope? Create a Shagun Card
          </Link>
        </div>

      </main>
    </div>
  );
}
