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

export default function PetSuccess() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPet = async () => {
      try {
        const res = await fetch(`/api/pet/get?id=${id}`);
        if (res.ok) {
          const resJson = await res.json();
          setData(resJson.pet);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleCopyLink = () => {
    if (!data) return;
    const shareUrl = `${window.location.origin}/pet/${data.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="pet-success-root min-h-screen flex items-center justify-center p-4 bg-[#fff5f6] font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-solid border-stone-200">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Pet Not Found</h2>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            We couldn't retrieve details for this digital pet. It may have been deleted or does not exist.
          </p>
          <Link href="/create-pet" className="inline-block bg-[#be185d] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full no-underline">
            Create a New Pet
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="pet-success-root min-h-screen flex items-center justify-center bg-[#fff5f6] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#be185d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-stone-600">Finalizing adoption details...</p>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pet/${data.id}` : "";

  return (
    <div className="pet-success-root min-h-screen pb-20 bg-[#fff5f6] font-sans flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Manrope:wght@400;500;600;700;800&display=swap');
        
        .pet-success-root {
          font-family: 'Manrope', sans-serif;
          color: #3e2723;
        }

        .font-serif-playfair {
          font-family: 'Playfair Display', serif;
        }

        .ps-card {
          background: #ffffff;
          box-shadow: 0 10px 40px rgba(228, 141, 156, 0.15);
          border: 1px solid rgba(228, 141, 156, 0.2);
        }

        .ps-share-box {
          background: #fff5f6;
          border: 1.5px dashed rgba(190, 24, 93, 0.25);
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0.85rem 1.5rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-decoration: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #be185d, #ec4899);
          color: white;
          box-shadow: 0 6px 20px rgba(190, 24, 93, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(190, 24, 93, 0.3);
        }

        .btn-secondary {
          background: #fff;
          color: #be185d;
          border: 1.5px solid rgba(190, 24, 93, 0.3);
        }

        .btn-secondary:hover {
          background: #fff5f6;
          border-color: #be185d;
        }

        .success-badge {
          animation: checkScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes checkScale {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-solid border-stone-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/create-pet" className="text-[#be185d] font-bold text-sm tracking-wide hover:opacity-75 transition-opacity no-underline">
            Adopt New Pet
          </Link>
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8" />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="w-full max-w-xl px-4 mt-8">
        <div className="ps-card rounded-[2.5rem] p-8 md:p-10 text-center relative overflow-hidden">
          
          {/* Confetti / Success Badge */}
          <div className="success-badge w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-md">
            🎉
          </div>

          <span className="text-xs font-bold tracking-widest uppercase text-[#be185d] opacity-80 block mb-1">
            Adoption Confirmed
          </span>
          <h1 className="font-serif-playfair text-3xl md:text-4xl font-extrabold text-[#3e2723] mb-6 leading-tight">
            {data.petName} is Adopted!
          </h1>

          <div className="bg-[#fff9fa] rounded-2xl p-5 border border-solid border-[#e48d9c]/20 max-w-sm mx-auto mb-8 flex flex-col items-center gap-3">
            <span className="text-6xl animate-bounce">{ANIMAL_EMOJIS[data.petType]}</span>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Pet Adoption Details</span>
              <p className="font-extrabold text-sm text-[#3e2723] mt-0.5">{data.petName} ({data.petType})</p>
              <p className="text-xs text-[#be185d] font-semibold mt-1">
                {data.isTestMode ? "⚡ Test Mode Enabled (10-min decay)" : "📅 Standard Mode (24-hour decay)"}
              </p>
            </div>
          </div>

          {/* Share Box */}
          <div className="ps-share-box rounded-2xl p-5 mb-8 max-w-md mx-auto text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#be185d] block mb-2">
              Share Care Link with Recipient
            </span>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              Send this unique care link to the recipient. They must check in to feed, play, and talk to {data.petName}. If neglected, {data.petName} will run away back to your yard!
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => e.target.select()}
                className="flex-grow p-3 rounded-xl border border-solid border-stone-200 outline-none text-xs font-mono font-semibold bg-white"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-[#be185d] text-white text-xs font-bold uppercase tracking-wider rounded-xl border-none cursor-pointer hover:bg-[#9d174d] transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hey! I adopted a digital pet named ${data.petName} for you! 🐾 Open this link to adopt them, feed them, and keep them happy: ${shareUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-action btn-primary w-full sm:w-auto"
            >
              💬 Send on WhatsApp
            </a>
            <Link
              href={`/pet/${data.id}`}
              className="btn-action btn-secondary w-full sm:w-auto"
            >
              🎮 Go to Care Page
            </Link>
            <Link
              href={`/pet/${data.id}/yard`}
              className="btn-action btn-secondary w-full sm:w-auto"
            >
              🏡 Visit Sender's Yard
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
