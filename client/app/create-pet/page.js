"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../src/components/LanguageSwitcher";

const PET_TYPES = [
  { id: "puppy", name: "Puppy Dog", emoji: "🐶", desc: "Loyal, energetic, and always excited to play!" },
  { id: "kitten", name: "Sweet Kitten", emoji: "🐱", desc: "Curious, soft, and loves gentle petting." },
  { id: "panda", name: "Fluffy Panda", emoji: "🐼", desc: "Sleepy, peaceful, and eats lots of bamboo." },
  { id: "bunny", name: "Playful Bunny", emoji: "🐰", desc: "Hoppy, active, and loves crunchy treats." },
];

export default function CreatePet() {
  const router = useRouter();
  const { t } = useTranslation();

  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [petType, setPetType] = useState("puppy");
  const [petName, setPetName] = useState("");
  const [message, setMessage] = useState("");
  const [isTestMode, setIsTestMode] = useState(true); // Default to true for easy user testing!
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderName.trim() || !receiverName.trim() || !petName.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/pet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: senderName.trim(),
          receiverName: receiverName.trim(),
          petType,
          petName: petName.trim(),
          message: message.trim(),
          isTestMode,
          paymentStatus: "free",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Direct navigate to payment/checkout screen, passing the new pet ID
        router.push(`/payment-pet?id=${data.id}`);
      } else {
        setError(data.error || "Failed to adopt pet. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pet-create-root min-h-screen pb-20 bg-[#fff5f6] font-sans flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Manrope:wght@400;500;600;700;800&display=swap');
        
        .pet-create-root {
          font-family: 'Manrope', sans-serif;
          color: #3e2723;
        }

        .font-serif-playfair {
          font-family: 'Playfair Display', serif;
        }

        .pet-card {
          background: #ffffff;
          box-shadow: 0 10px 40px rgba(228, 141, 156, 0.15);
          border: 1px solid rgba(228, 141, 156, 0.2);
        }

        .pet-option {
          border: 2px solid transparent;
          background: #fff9fa;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        .pet-option:hover {
          transform: translateY(-3px);
          border-color: #fbc4ab;
          background: #fff;
        }

        .pet-option.selected {
          border-color: #be185d;
          background: #fff0f2;
          box-shadow: 0 4px 15px rgba(190, 24, 93, 0.1);
        }

        .form-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1.5px solid rgba(97, 75, 61, 0.15);
          border-radius: 1rem;
          outline: none;
          font-size: 0.9rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 500;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          border-color: #be185d;
        }

        .btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #be185d, #ec4899);
          color: white;
          border: none;
          border-radius: 9999px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(190, 24, 93, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(190, 24, 93, 0.35);
        }

        .btn-submit:disabled {
          background: #e4d0d5;
          color: #a0888d;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
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
        <div className="pet-card rounded-[2.5rem] p-8 md:p-10">
          
          {/* Headline */}
          <div className="text-center mb-8">
            <span className="text-xs font-bold tracking-widest uppercase text-[#be185d] opacity-80 block mb-2">
              Virtual Gift Adoption
            </span>
            <h1 className="font-serif-playfair text-3xl md:text-4xl font-extrabold text-[#3e2723] leading-tight">
              Adopt a Digital Pet
            </h1>
            <p className="text-sm text-[#705f58] mt-2 max-w-sm mx-auto leading-relaxed">
              Design a virtual companion for your loved one. They must care for it, feed it, and keep it happy!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Step 1: Choose Animal */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                1. Select Pet Type *
              </span>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {PET_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className={`pet-option rounded-2xl p-4 flex flex-col items-center text-center gap-2 ${
                      petType === type.id ? "selected" : ""
                    }`}
                    onClick={() => setPetType(type.id)}
                  >
                    <span className="text-4xl">{type.emoji}</span>
                    <span className="font-bold text-sm text-[#3e2723]">{type.name}</span>
                    <span className="text-[10px] text-[#705f58] leading-tight">{type.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Names */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">Sender's Name *</span>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">Recipient's Name *</span>
                <input
                  type="text"
                  required
                  placeholder="Their name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Step 3: Pet Name */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">3. Name Your Pet *</span>
              <input
                type="text"
                required
                placeholder="e.g. Bella, Max, Luna, Bruno"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="form-input font-bold"
              />
            </div>

            {/* Step 4: Greeting Message */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">4. Greeting Card Message (Optional)</span>
              <textarea
                placeholder="Write a sweet message tags, wishes, or pet-care tips..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="form-input resize-none text-sm"
              />
            </div>

            {/* Step 5: Test Mode Toggle */}
            <div className="bg-[#fff9fa] p-4 rounded-2xl border border-solid border-[#e48d9c]/20 flex items-start gap-3 mt-2">
              <input
                type="checkbox"
                id="test-mode-chk"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                className="mt-1 cursor-pointer w-4.5 h-4.5 accent-[#be185d]"
              />
              <div className="flex flex-col gap-0.5 select-none cursor-pointer" onClick={() => setIsTestMode(!isTestMode)}>
                <label htmlFor="test-mode-chk" className="text-xs font-bold text-[#be185d] uppercase tracking-wide">
                  Enable Test Mode (Recommended)
                </label>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Stats decay fully in <strong>10 minutes</strong> instead of 24 hours. Pet gets sick after 5 mins and runs away after 10 mins. Perfect for instant demoing!
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-[#fff2f2] text-[#be185d] p-4 rounded-xl text-xs font-bold border border-solid border-[#fee2e2]">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-submit mt-2">
              {isSubmitting ? "Generating Link..." : "Adopt & Continue 🐾"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
