"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../src/components/LanguageSwitcher";

const TIP_INR = [
  { id: "tier1", label: "Basic Care", amount: 29, display: "₹29" },
  { id: "tier2", label: "Deluxe Care", amount: 59, display: "₹59" },
  { id: "tier3", label: "Ultimate Care", amount: 69, display: "₹69" },
];

const TIP_USD = [
  { id: "tier1", label: "Basic Care", amount: 1.99, display: "$1.99" },
  { id: "tier2", label: "Deluxe Care", amount: 2.99, display: "$2.99" },
  { id: "tier3", label: "Ultimate Care", amount: 3.99, display: "$3.99" },
];

function PaymentPetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { t } = useTranslation();

  const [currency, setCurrency] = useState("INR");
  const [selectedTip, setSelectedTip] = useState("tier2");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Determine country code
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
        setCurrency("INR");
      } else {
        setCurrency("USD");
      }
    } catch {
      setCurrency("INR");
    }
  }, []);

  const tips = currency === "INR" ? TIP_INR : TIP_USD;
  const activeTip = tips.find(t => t.id === selectedTip) || tips[1];

  const handleFreeCheckout = () => {
    setIsProcessing(true);
    // Simulate short loader
    setTimeout(() => {
      router.push(`/pet/success/${id}`);
    }, 800);
  };

  return (
    <div className="pet-pay-root min-h-screen pb-20 bg-[#fff5f6] font-sans flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Manrope:wght@400;500;600;700;800&display=swap');
        
        .pet-pay-root {
          font-family: 'Manrope', sans-serif;
          color: #3e2723;
        }

        .font-serif-playfair {
          font-family: 'Playfair Display', serif;
        }

        .pp-card {
          background: #ffffff;
          box-shadow: 0 10px 40px rgba(228, 141, 156, 0.15);
          border: 1px solid rgba(228, 141, 156, 0.2);
        }

        .pp-tip-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .pp-tip {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0.85rem 0.5rem;
          border-radius: 1rem;
          border: 2px solid transparent;
          background: #fff5f6;
          cursor: pointer;
          transition: all 0.18s;
        }

        .pp-tip:hover {
          border-color: #f9a8d4;
        }

        .pp-tip.selected {
          border-color: #be185d;
          background: #fce7f3;
        }

        .pp-tip-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9d174d;
        }

        .pp-tip-amount {
          font-size: 1rem;
          font-weight: 800;
          color: #3e2723;
        }

        .pp-cta {
          width: 100%;
          padding: 0.9rem;
          border: none;
          border-radius: 9999px;
          background: linear-gradient(135deg, #be185d, #ec4899);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(190, 24, 93, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .pp-cta:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(190, 24, 93, 0.35);
        }

        .pp-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          color: #be185d;
          font-size: 0.78rem;
          font-weight: 700;
          border: 1.5px solid rgba(190, 24, 93, 0.25);
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
          width: 100%;
        }

        .pp-ghost:hover {
          background: #fff5f6;
          border-color: #be185d;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-solid border-stone-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/create-pet" className="text-[#be185d] font-bold text-sm tracking-wide hover:opacity-75 transition-opacity no-underline flex items-center gap-1">
            ← Edit Pet
          </Link>
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8" />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="w-full max-w-sm px-4 mt-10">
        <div className="pp-card rounded-[2.5rem] p-6 md:p-8">
          
          <div className="text-center mb-6">
            <span className="text-[2.5rem] block mb-2">🎁</span>
            <h2 className="font-serif-playfair text-2xl font-extrabold text-[#3e2723]">Adopt Your Pet</h2>
            <p className="text-xs text-[#705f58] mt-1.5 leading-relaxed">
              Unlock adoption credentials, dynamic tracking link, and the interactive playground.
            </p>
          </div>

          {/* Pricing Options */}
          <div className="flex flex-col gap-2.5 mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Select Care Tipping Option
            </span>
            <div className="pp-tip-row">
              {tips.map((t) => (
                <div
                  key={t.id}
                  className={`pp-tip ${selectedTip === t.id ? "selected" : ""}`}
                  onClick={() => setSelectedTip(t.id)}
                >
                  <span className="pp-tip-label">{t.label.split(" ")[0]}</span>
                  <span className="pp-tip-amount">{t.display}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Pay Button */}
            <button
              onClick={handleFreeCheckout}
              disabled={isProcessing}
              className="pp-cta"
            >
              {isProcessing ? "Processing Adoption..." : `Pay ${activeTip.display} & Adopt`}
            </button>

            {/* Free/Demo Button */}
            <div className="text-center my-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              — OR —
            </div>

            <button
              onClick={handleFreeCheckout}
              disabled={isProcessing}
              className="pp-ghost"
            >
              🚀 Free Demo Checkout
            </button>
          </div>

          {/* Bottom Trust Badge */}
          <div className="border-t border-solid border-stone-100 mt-6 pt-5 text-center flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#be185d]">
              100% Satisfaction Guarantee
            </span>
            <p className="text-[9.5px] text-stone-400 leading-normal">
              Direct transfer. Instant delivery. Recipient receives email/SMS and Google auth-linked gameplay link.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PaymentPet() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-sans text-stone-500">Loading Checkout...</div>}>
      <PaymentPetContent />
    </Suspense>
  );
}
