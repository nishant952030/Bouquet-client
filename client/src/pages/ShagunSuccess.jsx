import { useEffect, useState } from "react";
import { Link, useParams, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { applySeo } from "../lib/seo";

const THEME_STYLES = {
  wedding: {
    name: "Royal Wedding",
    bg: "#fffdf9",
    border: "#f3ebd9",
    text: "#5c4933",
    banner: "linear-gradient(135deg, #8b0000 0%, #b22222 100%)",
    emoji: "🌸",
    accent: "#b22222",
  },
  eid: {
    name: "Festive Eid",
    bg: "#f4fcf7",
    border: "#d1fae5",
    text: "#065f46",
    banner: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
    emoji: "🌙",
    accent: "#065f46",
  },
  diwali: {
    name: "Auspicious Diwali",
    bg: "#fffaf0",
    border: "#fef3c7",
    text: "#78350f",
    banner: "linear-gradient(135deg, #b91c1c 0%, #d97706 100%)",
    emoji: "🪔",
    accent: "#b91c1c",
  },
  birthday: {
    name: "Celebration Cash",
    bg: "#faf5ff",
    border: "#ede9fe",
    text: "#5b21b6",
    banner: "linear-gradient(135deg, #6d28d9 0%, #db2777 100%)",
    emoji: "🎉",
    accent: "#6d28d9",
  },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  .success-root {
    font-family: 'Outfit', sans-serif;
    background: #faf8f5;
    color: #2d251e;
    min-height: 100vh;
  }

  .success-card {
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
  }

  .font-serif-playfair {
    font-family: 'Playfair Display', serif;
  }

  /* PRINT STYLE - Isolates ONLY the printable-voucher container */
  @media print {
    body * {
      visibility: hidden;
      background: none !important;
    }
    .printable-voucher, .printable-voucher * {
      visibility: visible;
    }
    .printable-voucher {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      max-width: 600px;
      margin: 0;
      padding: 0;
      border: 1px solid #c5a880 !important;
      box-shadow: none !important;
      background: #fffdf9 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-hide {
      display: none !important;
    }
  }

  .success-badge {
    animation: checkScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes checkScale {
    from { transform: scale(0.7); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

export default function ShagunSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchShagun = async () => {
      if (!id) {
        setError(true);
        setIsLoading(false);
        return;
      }

      try {
        if (isFirebaseConfigured && db) {
          const snap = await getDoc(doc(db, "cards", id));
          if (snap.exists()) {
            const shagunData = snap.data();
            const claimSnap = await getDoc(doc(db, "cards", "claim_success_" + id));
            if (claimSnap.exists()) {
              const claimData = claimSnap.data();
              shagunData.status = "claimed";
              shagunData.receiverRealName = claimData.receiverRealName;
              shagunData.receiverUpi = claimData.receiverUpi;
              shagunData.claimedAt = claimData.claimedAt;
              shagunData.utr = claimData.utr;
            }
            if (!cancelled) {
              setData(shagunData);
              setIsLoading(false);
            }
            return;
          }
        }

        // Fallback to local storage (for offline or local demo checks)
        const localRaw = localStorage.getItem(`shagun_share_${id}`);
        if (localRaw) {
          const localData = JSON.parse(localRaw);
          if (!cancelled) {
            setData(localData);
            setIsLoading(false);
          }
        } else {
          if (!cancelled) {
            setError(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error loading shagun gift details:", err);
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    fetchShagun();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    applySeo({
      title: "Your Shagun Envelope is Ready! | Petals and Words",
      robots: "noindex,nofollow",
      path: `/shagun/success/${id}`,
    });
  }, [id]);

  if (error) return <Navigate to="/shagun" replace />;
  if (isLoading || !data) {
    return (
      <div className="success-root flex items-center justify-center min-h-screen">
        <style>{CSS}</style>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#7c4343] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#705f58]">Loading your gifting envelope details...</p>
        </div>
      </div>
    );
  }

  const themeStyle = THEME_STYLES[data.theme] || THEME_STYLES.wedding;
  const claimUrl = `${window.location.origin}/claim/${data.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(claimUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="success-root pb-20">
      <style>{CSS}</style>

      {/* Header (print-hide) */}
      <header className="shagun-header sticky top-0 z-30 w-full print-hide bg-white/95">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-decoration-none">
            <img src="/logo-transparent.png" alt="Petals & Words" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/shagun" className="text-sm font-semibold text-[#7c4343] text-decoration-none">
              Create Another
            </Link>
            <Link to="/" className="text-sm font-semibold text-stone-500 text-decoration-none">
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Print instructions & Action center (print-hide) */}
        <div className="md:col-span-5 flex flex-col gap-6 print-hide">
          
          <div className="success-card rounded-3xl p-6 border border-solid border-[#ede9e2] text-center">
            <div className="success-badge w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-4">
              ✓
            </div>
            <h1 className="font-serif-playfair text-2xl font-bold text-[#3d3028] mb-2">
              Payment Successful!
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              Your digital Shagun voucher is ready. We have charged ₹{data.amount + data.fee} securely via Razorpay.
            </p>
            <div className="bg-stone-50 rounded-xl p-3 text-left border border-solid border-[#ede9e2] text-xs text-[#5c4a40] flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Gift Amount:</span>
                <span className="font-bold">₹{data.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference ID:</span>
                <span className="font-mono text-[10px]">{data.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-600 font-bold">PAID</span>
              </div>
            </div>
          </div>

          {/* Action Choice: Print vs Digital Link */}
          <div className="success-card rounded-3xl p-6 border border-solid border-[#ede9e2] flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c4343]">
              Choose How to Deliver
            </h3>

            {/* Option A: Physical Print */}
            <div className="border border-solid border-[#ede9e2] hover:border-[#7c4343]/30 p-4 rounded-2xl flex flex-col gap-2.5 transition-all">
              <span className="text-xs font-bold text-[#3d3028] flex items-center gap-1.5">
                🖨️ Option A: Print Physical Voucher (Recommended)
              </span>
              <p className="text-[11px] text-stone-500 leading-normal">
                Perfect for weddings and physical events. Print this voucher card, cut it along the borders, and slide it inside a standard decorative envelope.
              </p>
              <button
                onClick={handlePrint}
                className="w-full bg-[#7c4343] hover:bg-[#5c2d2d] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                Print Envelope Insert 🖨️
              </button>
            </div>

            {/* Option B: Digital Share */}
            <div className="border border-solid border-[#ede9e2] hover:border-[#7c4343]/30 p-4 rounded-2xl flex flex-col gap-2.5 transition-all">
              <span className="text-xs font-bold text-[#3d3028] flex items-center gap-1.5">
                🔗 Option B: Share Link Digitally
              </span>
              <p className="text-[11px] text-stone-500 leading-normal">
                Perfect for NRIs, remote relatives, or instant messaging. Copy the secure claim link and send it via WhatsApp or Email.
              </p>
              <button
                onClick={handleCopyLink}
                className="w-full bg-stone-100 hover:bg-[#7c4343] hover:text-white text-stone-700 text-xs font-bold uppercase tracking-wider py-3 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? "Link Copied! ✓" : "Copy Claim Link 🔗"}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Here is a digital Shagun envelope gift for you! Click the link to claim ₹${data.amount} to your UPI: ${claimUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 text-decoration-none transition-colors"
              >
                Share via WhatsApp 💬
              </a>
            </div>

          </div>

        </div>

        {/* Right column: The printable voucher view */}
        <div className="md:col-span-7 flex flex-col items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500 print-hide">
            📄 Voucher Preview (Matches printed output)
          </span>

          {/* Printable Voucher Card Container */}
          <div
            className="printable-voucher success-card w-full rounded-3xl border border-solid overflow-hidden relative"
            style={{
              background: themeStyle.bg,
              borderColor: themeStyle.border,
              maxWidth: "540px",
              boxShadow: "0 20px 50px rgba(124, 67, 67, 0.08)",
            }}
          >
            {/* Header Banner */}
            <div
              className="h-14 w-full flex items-center justify-between px-5 text-white font-bold"
              style={{ background: themeStyle.banner }}
            >
              <span className="text-xs tracking-widest font-extrabold">DIGITAL SHAGUN GIFT</span>
              <span className="text-2xl leading-none">{themeStyle.emoji}</span>
            </div>

            {/* Inner Content */}
            <div className="p-6 flex flex-col items-center justify-between min-h-[380px] text-center gap-6">
              
              {/* Auspicious Greeting */}
              <div>
                {data.receiverName && (
                  <p className="text-[10px] uppercase tracking-widest text-[#a6958a] font-bold mb-1">
                    Warmest Wishes to: {data.receiverName}
                  </p>
                )}
                <h2 className="font-serif-playfair text-3xl font-extrabold" style={{ color: themeStyle.text }}>
                  Shagun of ₹{data.amount}
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-[#a6958a] font-bold mt-1">
                  Sent with Love by: {data.senderName}
                </p>
              </div>

              {/* Message Note */}
              <div className="bg-[#ffffff]/90 p-4 rounded-2xl border border-dashed border-[#ede9e2] max-w-[320px] w-full">
                <p className="text-xs italic text-[#5c4a40] leading-relaxed">
                  "{data.message || "Wishing you both a lifetime of happiness, love, and laughter!"}"
                </p>
              </div>

              {/* QR and Claim Instruction Grid */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-[420px] bg-[#ffffff]/60 p-4 rounded-2xl border border-solid border-[#ede9e2]">
                
                {/* QR Code */}
                <div className="w-28 h-28 bg-white rounded-xl border border-solid border-[#ede9e2] p-1.5 flex items-center justify-center shadow-sm flex-shrink-0">
                  <img src={qrCodeUrl} alt="Claim QR Code" className="w-full h-full object-contain" />
                </div>

                {/* Instructions */}
                <div className="text-left flex flex-col gap-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: themeStyle.text }}>
                    How to Claim your Gift:
                  </h4>
                  <ol className="text-[10px] text-stone-600 pl-4 list-decimal flex flex-col gap-1">
                    <li>Scan this QR using your phone camera or any scanner app.</li>
                    <li>Enter your UPI ID (e.g., name@okaxis) on the secure claim page.</li>
                    <li>Funds transfer instantly to your account.</li>
                  </ol>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-700 font-extrabold uppercase tracking-wide">
                    <span>🛡️ Safe Transfer:</span>
                    <span>No UPI PIN or Password needed to receive.</span>
                  </div>
                </div>

              </div>

              {/* Footer text */}
              <div className="text-[9px] text-[#a6958a] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span>Voucher ID: {data.id}</span>
                <span>•</span>
                <span>Powered by Petals & Words</span>
              </div>

            </div>

          </div>

          <p className="text-[11px] text-stone-400 italic text-center max-w-sm leading-relaxed print-hide">
            💡 Pro Tip: Standard A4 paper prints this beautifully. Make sure to cut along the outer borders of the card insert for a neat envelope presentation!
          </p>

        </div>

      </div>
    </div>
  );
}
