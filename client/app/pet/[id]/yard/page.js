"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../../../src/components/LanguageSwitcher";

const ANIMAL_EMOJIS = {
  puppy: "🐶",
  kitten: "🐱",
  panda: "🐼",
  bunny: "🐰",
};

export default function SenderYard() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHealing, setIsHealing] = useState(false);
  const [healSuccess, setHealSuccess] = useState(false);

  const fetchPet = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/pet/get?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setPet(data.pet);
      } else {
        const errJson = await res.json();
        setError(errJson.error || "Failed to fetch pet details");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching pet status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [id]);

  // Audio chimes on successful healing
  const playHealChimes = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      // High rising healing sound
      osc.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.1); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.5); // C6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  // Browser Speech Synthesis integration for sender yard
  const speakHealed = (text) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleHeal = async () => {
    if (!pet) return;
    setIsHealing(true);
    setError("");

    try {
      const res = await fetch("/api/pet/heal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pet.id }),
      });

      if (res.ok) {
        setHealSuccess(true);
        playHealChimes();
        speakHealed(`Success! ${pet.petName} is nursed back to health and has happily returned to ${pet.receiverName}!`);
        await fetchPet();
        setTimeout(() => setHealSuccess(false), 5000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to heal pet.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error healing pet.");
    } finally {
      setIsHealing(false);
    }
  };

  if (error && !pet) {
    return (
      <div className="pet-yard-root min-h-screen flex items-center justify-center p-4 bg-[#fff5f6] font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-solid border-stone-200">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Error Loading Yard</h2>
          <p className="text-xs text-[#be185d] leading-relaxed mb-6">
            {error}
          </p>
          <Link href="/" className="inline-block bg-[#be185d] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full no-underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !pet) {
    return (
      <div className="pet-yard-root min-h-screen flex items-center justify-center bg-[#fff5f6] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#be185d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-stone-600">Loading sender's yard details...</p>
        </div>
      </div>
    );
  }

  const isRunaway = pet.status === "runaway";

  return (
    <div className="pet-yard-root min-h-screen pb-20 bg-[#fff5f6] font-sans flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Manrope:wght@400;500;600;700;800&display=swap');
        
        .pet-yard-root {
          font-family: 'Manrope', sans-serif;
          color: #3e2723;
        }

        .font-serif-playfair {
          font-family: 'Playfair Display', serif;
        }

        .py-card {
          background: #ffffff;
          box-shadow: 0 10px 40px rgba(228, 141, 156, 0.15);
          border: 1px solid rgba(228, 141, 156, 0.2);
        }

        .py-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .py-badge-active {
          background: #d1fae5;
          color: #065f46;
        }

        .py-badge-runaway {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-heal {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 9999px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-heal:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.35);
        }

        .btn-heal:disabled {
          background: #d1fae5;
          color: #a0bba8;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .yard-pet-emoji {
          animation: yardFloat 2s infinite ease-in-out;
        }

        @keyframes yardFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-solid border-stone-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#be185d] font-bold text-sm tracking-wide hover:opacity-75 transition-opacity no-underline flex items-center gap-1">
            ← Home
          </Link>
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8" />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="w-full max-w-xl px-4 mt-8">
        <div className="py-card rounded-[2.5rem] p-8 md:p-10 text-center relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-8 border-b border-solid border-stone-100 pb-4">
            <div className="text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Pet Backyard Monitor</span>
              <h1 className="font-extrabold text-base text-[#3e2723]">{pet.petName}'s Yard</h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Status</span>
              <div className={`py-badge ${isRunaway ? "py-badge-runaway" : "py-badge-active"} mt-0.5`}>
                {pet.status}
              </div>
            </div>
          </div>

          {/* ── STATE A: Pet has run away (Retrieve loop active) ── */}
          {isRunaway && (
            <div className="flex flex-col gap-6">
              <div className="bg-red-50 text-red-900 border border-solid border-red-100 rounded-2xl p-5 text-xs leading-relaxed max-w-md mx-auto">
                😔 <strong>{pet.petName} has run away back to your yard!</strong>
                <p className="mt-1 text-stone-500">
                  {pet.receiverName} neglected {pet.petName}'s hunger or attention stats for too long. {pet.petName} looks weak and sick. Nurse them back to health to return them to {pet.receiverName}!
                </p>
              </div>

              <div className="text-[7.5rem] leading-none select-none my-4 yard-pet-emoji">
                🏥
              </div>

              {healSuccess && (
                <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl text-xs font-bold border border-solid border-emerald-200">
                  ✓ {pet.petName} is healed and returned!
                </div>
              )}

              {error && (
                <div className="bg-[#fff2f2] text-[#be185d] p-3.5 rounded-xl text-xs font-bold border border-solid border-[#fee2e2]">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleHeal}
                disabled={isHealing}
                className="btn-heal max-w-xs mx-auto"
              >
                {isHealing ? "Healing..." : `Nurse ${pet.petName} Back to Health 💊`}
              </button>
            </div>
          )}

          {/* ── STATE B: Pet is healthy and with the receiver ── */}
          {!isRunaway && (
            <div className="flex flex-col gap-6">
              <div className="bg-emerald-50 text-emerald-900 border border-solid border-emerald-100 rounded-2xl p-5 text-xs leading-relaxed max-w-md mx-auto">
                😊 <strong>{pet.petName} is currently with {pet.receiverName}!</strong>
                <p className="mt-1 text-stone-500">
                  They are happily playing and eating. Keep checking this yard monitor. If they are neglected, they will automatically run away back here.
                </p>
              </div>

              <div className="text-[7.5rem] leading-none select-none my-4 yard-pet-emoji">
                {ANIMAL_EMOJIS[pet.petType] || "🐶"}
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-4 text-left bg-stone-50 p-4 rounded-2xl border border-solid border-stone-200/50">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Hunger Level</span>
                  <p className="font-extrabold text-sm text-[#3e2723] mt-0.5">{pet.hunger}%</p>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Attention Level</span>
                  <p className="font-extrabold text-sm text-[#3e2723] mt-0.5">{pet.attention}%</p>
                </div>
                <div className="col-span-2 border-t border-solid border-stone-200 mt-2 pt-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">Heal/Revive Count</span>
                  <p className="font-extrabold text-sm text-[#be185d] mt-0.5">{pet.healedCount || 0} times</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href={`/pet/${pet.id}`}
                  className="px-6 py-3 bg-[#be185d] hover:bg-[#9d174d] text-white text-xs font-bold uppercase tracking-wider rounded-full no-underline transition-all"
                >
                  Visit Care Playroom 🎮
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
