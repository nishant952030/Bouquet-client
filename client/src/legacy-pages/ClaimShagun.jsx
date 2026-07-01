import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { applySeo } from "../lib/seo";

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
    bg: "linear-gradient(135deg, #fffaf2 0%, #fff2dc 100%)",
    border: "#fef3c7",
    text: "#78350f",
    banner: "linear-gradient(135deg, #b91c1c 0%, #d97706 100%)",
    emoji: "🪔",
    accent: "#b91c1c",
  },
  birthday: {
    name: "Celebration Cash",
    bg: "linear-gradient(135deg, #faf7ff 0%, #f3ebff 100%)",
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
    background: #faf8f5;
    color: #2d251e;
    min-height: 100vh;
  }

  .font-serif-playfair {
    font-family: 'Playfair Display', serif;
  }

  .trust-banner {
    background: #f0f7ff;
    border: 1.5px solid #d0e7ff;
    color: #0c4a6e;
  }

  .confetti-piece {
    position: fixed;
    width: 10px;
    height: 20px;
    top: -20px;
    z-index: 100;
    opacity: 0;
    animation: fall var(--dur) linear forwards var(--delay);
  }

  @keyframes fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }

  .claim-btn {
    background: linear-gradient(135deg, #7c4343 0%, #5c2d2d 100%);
    box-shadow: 0 8px 24px rgba(124, 67, 67, 0.2);
    transition: all 0.2s ease;
  }

  .claim-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124, 67, 67, 0.3);
  }

  .claim-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .input-field {
    padding: 12px 14px;
    width: 100%;
    border-radius: 12px;
    border: 1.5px solid #e7dfd5;
    outline: none;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    background: white;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .input-field:focus {
    border-color: #7c4343;
  }
`;

function Confetti() {
  const colors = ["#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#2196f3", "#00bcd4", "#4caf50", "#ffeb3b", "#ff9800"];
  const [pieces] = useState(() =>
    Array.from({ length: 70 }, (_, index) => (
      <div
        className="confetti-piece"
        key={index}
        style={{
          left: `${Math.random() * 100}vw`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          "--dur": `${2.5 + Math.random() * 2.5}s`,
          "--delay": `${Math.random() * 0.5}s`,
          borderRadius: Math.random() > 0.5 ? "50%" : "0",
          width: `${6 + Math.random() * 6}px`,
          height: `${6 + Math.random() * 12}px`,
        }}
      />
    ))
  );
  return <>{pieces}</>;
}



export default function ClaimShagun() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);


  // Form fields
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  // Field errors
  const [errors, setErrors] = useState({});


  // Disclaimer
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [disclaimerError, setDisclaimerError] = useState("");

  // Claim submission
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState("");

  const hasSynthesizedAudio = useRef(false);

  // Fetch shagun data
  useEffect(() => {
    let cancelled = false;
    const fetchShagun = async () => {
      if (!id) { setFetchError(true); setIsLoading(false); return; }
      try {
        // Fetch securely from our serverless function
        const res = await fetch(`/api/shagun/get?id=${id}`);
        if (res.ok) {
          const shagunData = await res.json();
          if (!cancelled) {
            setData(shagunData);
            setIsLoading(false);
          }
          return;
        }

        // Fallback to local storage (for offline or local demo checks)
        const localRaw = localStorage.getItem(`shagun_share_${id}`);
        if (localRaw) {
          if (!cancelled) { setData(JSON.parse(localRaw)); setIsLoading(false); }
        } else {
          if (!cancelled) { setFetchError(true); setIsLoading(false); }
        }
      } catch (err) {
        console.error("Error fetching shagun:", err);
        if (!cancelled) { setFetchError(true); setIsLoading(false); }
      }
    };

    fetchShagun();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!data) return;
    applySeo({
      title: `Claim your Shagun Gift from ${data.senderName} | Petals & Words`,
      robots: "noindex,nofollow",
    });
  }, [data]);

  const playClaimMelody = () => {
    if (hasSynthesizedAudio.current) return;
    hasSynthesizedAudio.current = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.25;
      masterGain.connect(ctx.destination);
      const melody = [
        [392.00, 0.15], [440.00, 0.15], [523.25, 0.15],
        [587.33, 0.15], [659.25, 0.25], [783.99, 0.40],
        [659.25, 0.15], [783.99, 0.15], [880.00, 0.50],
      ];
      let time = ctx.currentTime + 0.05;
      melody.forEach(([frequency, duration]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.8, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.02);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(time);
        osc.stop(time + duration);
        time += duration - 0.03;
      });
    } catch (e) {
      console.warn("Melody synthesis failed", e);
    }
  };



  // Submit the claim
  const handleClaimGift = async (e) => {
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
          <Link to="/" className="inline-block bg-[#7c4343] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full no-underline">
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
  const isAlreadyClaimed = data.claimStatus === "claimed";
  const isPayoutPending = data.claimStatus === "payout_pending";
  const isAlreadyProcessed = isAlreadyClaimed || isPayoutPending;

  return (
    <div className="claim-root flex flex-col justify-between pb-12">
      <style>{CSS}</style>
      {claimSuccess && <Confetti />}

      {/* Header */}
      <header className="sticky top-0 z-30 w-full py-3.5 bg-white/95 border-b border-[#ede9e2]">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">
          <img src="/logo-transparent.png" alt="Petals & Words" className="h-6" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#a65d5d] bg-[#fff0f1] px-2 py-0.5 rounded-full">
            🛡️ Secure QR Claim
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 flex-grow w-full">
        <div
          className="rounded-3xl border border-solid overflow-hidden shadow-md"
          style={{ background: themeStyle.bg, borderColor: themeStyle.border }}
        >
          {/* Theme Banner */}
          <div
            className="h-16 w-full flex items-center justify-between px-5 text-white font-bold"
            style={{ background: themeStyle.banner }}
          >
            <span className="text-xs tracking-widest font-extrabold uppercase">🌸 Received a Shagun Gift</span>
            <span className="text-2xl leading-none">{themeStyle.emoji}</span>
          </div>

          <div className="p-6 flex flex-col gap-6 text-center">

            {/* Amount + Sender */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#a6958a] font-bold mb-1">Auspicious Gift for You</p>
              <h1 className="font-serif-playfair text-4xl font-extrabold" style={{ color: themeStyle.text }}>
                ₹{data.amount}
              </h1>
              <p className="text-xs font-bold text-[#5c4a40] mt-1">
                From: <span className="text-stone-800 font-extrabold">{data.senderName}</span>
              </p>
            </div>

            {/* Message */}
            <div className="bg-white/80 p-4 rounded-2xl border border-dashed border-[#ede9e2]">
              <p className="text-sm italic text-stone-600 leading-relaxed font-serif-playfair">
                "{data.message || "Wishing you both a lifetime of happiness, love, and laughter!"}"
              </p>
            </div>

            {/* ── STATE A: Already fully claimed ── */}
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

                {/* Trust Banner */}
                <div className="trust-banner p-3.5 rounded-2xl flex gap-3 text-xs leading-normal">
                  <div className="text-xl flex-shrink-0">🛡️</div>
                  <div>
                    <span className="font-extrabold block mb-0.5 uppercase tracking-wide">NO UPI PIN NEEDED</span>
                    To receive money you only need to share your UPI ID. <strong>Never enter your PIN, password, or OTP to receive money.</strong> If any app asks for your PIN, it is a scam.
                  </div>
                </div>

                {/* ─── Single Form ─── */}
                <form onSubmit={handleClaimGift} className="flex flex-col gap-4">

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Phone Number (For Payout Updates)</label>
                    <input
                      className="input-field"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      maxLength={15}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setErrors(p => ({ ...p, phone: "" })); }}
                    />
                    {errors.phone && <span className="text-[11px] text-[#991b1b] font-bold">⚠️ {errors.phone}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">UPI ID to receive payment</label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="e.g. name@upi or mobile@okaxis"
                      value={upiId}
                      onChange={e => { setUpiId(e.target.value.trim()); setErrors(p => ({ ...p, upiId: "" })); }}
                    />
                    {errors.upiId && <span className="text-[11px] text-[#991b1b] font-bold">⚠️ {errors.upiId}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">UPI Account Holder Name</label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Exact name shown in GPay / PhonePe / Paytm"
                      value={upiName}
                      onChange={e => { setUpiName(e.target.value); setErrors(p => ({ ...p, upiName: "" })); }}
                    />
                    <p className="text-[10px] text-stone-400">Open your UPI app → tap profile to see the registered name.</p>
                    {errors.upiName && <span className="text-[11px] text-[#991b1b] font-bold">⚠️ {errors.upiName}</span>}
                  </div>

                  {/* Confirmation checkbox */}
                  <div className="bg-[#fcf8f2] border border-solid border-[#ebdcb9] p-4 rounded-2xl">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={disclaimerAccepted}
                        onChange={e => { setDisclaimerAccepted(e.target.checked); setDisclaimerError(""); }}
                        className="mt-0.5 w-4 h-4 accent-[#7c4343] flex-shrink-0"
                      />
                      <span className="text-[11px] font-semibold text-[#7c2d12] leading-snug">
                        I confirm that the UPI ID and account holder name provided above are correct. Transfers made to an incorrect UPI ID may not be recoverable.
                      </span>
                    </label>
                    {disclaimerError && <p className="text-[10px] text-[#991b1b] font-bold mt-2">⚠️ {disclaimerError}</p>}
                  </div>

                  {claimError && (
                    <div className="bg-[#fdf2f2] text-[#991b1b] p-3 rounded-xl text-xs font-semibold border border-solid border-[#fee2e2]">
                      ⚠️ {claimError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isClaiming || !disclaimerAccepted}
                    className="claim-btn w-full text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isClaiming ? (
                      <><div className="w-3.5 h-3.5 border-2 border-solid border-white/50 border-t-white rounded-full animate-spin" /> Submitting Claim Request...</>
                    ) : (
                      `Confirm & Claim ₹${data.amount} 💰`
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Footer trust badges */}
          <div className="bg-stone-50 border-t border-solid border-[#ede9e2] p-4 flex items-center justify-center gap-6 text-[10px] text-stone-500">
            <div className="flex items-center gap-1"><span>🛡️</span><span className="font-semibold">Secure Transfer</span></div>
            <div className="flex items-center gap-1"><span>🔒</span><span className="font-semibold">SSL Encrypted</span></div>
            <div className="flex items-center gap-1"><span>✅</span><span className="font-semibold">Manual Verified</span></div>
          </div>
        </div>
      </main>

      <footer className="max-w-md mx-auto px-4 mt-6 text-center w-full">
        <Link to="/shagun" className="text-[11px] font-bold text-[#7c4343] hover:text-[#5c2d2d] no-underline">
          Want to send a cash envelope gift? Create your own Digital Shagun envelope here ➔
        </Link>
      </footer>
    </div>
  );
}
