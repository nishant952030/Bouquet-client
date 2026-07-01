"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../../src/lib/firebase";
import LanguageSwitcher from "../../../src/components/LanguageSwitcher";

const ANIMAL_EMOJIS = {
  puppy: "🐶",
  kitten: "🐱",
  panda: "🐼",
  bunny: "🐰",
};

export default function PetDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isPerforming, setIsPerforming] = useState(false);

  // Sync auth state
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch pet details
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
    // Poll every 10 seconds to show real-time stats decay in front of their eyes!
    const timer = setInterval(fetchPet, 10000);
    return () => clearInterval(timer);
  }, [id]);

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      setError("Authentication is not configured on this project.");
      return;
    }
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && pet) {
        // Trigger claim on the backend
        const res = await fetch("/api/pet/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: pet.id,
            actionType: "feed", // default action to link userUid
            userUid: result.user.uid,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPet(data.pet);
        } else {
          setError(data.error || "Failed to claim pet ownership.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Google Login failed. Please try again.");
    }
  };

  // Play audio feedbacks (Chimes/Munching)
  const playSoundEffect = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "munch") {
        // Eating crunch sounds
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "happy") {
        // High happy chimes
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  // Browser Speech Synthesis integration for pet reactions
  const speakReaction = (text) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel previous speech first
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.25; // cute high pitched voice
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAction = async (actionType) => {
    if (!pet || !user) return;
    setIsPerforming(true);
    setError("");

    try {
      const res = await fetch("/api/pet/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pet.id,
          actionType,
          userUid: user.uid,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPet(data.pet);
        
        // Sound and Speech reactions based on action type
        if (actionType === "feed") {
          playSoundEffect("munch");
          setTimeout(() => {
            speakReaction(`Yummy! Thank you for feeding me, ${user.displayName || "my friend"}!`);
          }, 200);
        } else if (actionType === "play" || actionType === "pet") {
          playSoundEffect("happy");
          setTimeout(() => {
            speakReaction(`Yay! That feels so good! I love playing with you!`);
          }, 100);
        } else if (actionType === "talk") {
          playSoundEffect("happy");
          setTimeout(() => {
            const lines = [
              `Hello! I'm happy to be your pet!`,
              `You are my favorite human ever!`,
              `Let's go for a walk in the virtual park!`,
              `Are you having a good day? I hope you are!`,
            ];
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            speakReaction(randomLine);
          }, 100);
        }

      } else {
        setError(data.error || "Failed to perform action");
      }
    } catch (err) {
      console.error(err);
      setError("Network error performing action");
    } finally {
      setIsPerforming(false);
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  if (error && !pet) {
    return (
      <div className="pet-dash-root min-h-screen flex items-center justify-center p-4 bg-[#fff5f6] font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-solid border-stone-200">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Error Loading Pet</h2>
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
      <div className="pet-dash-root min-h-screen flex items-center justify-center bg-[#fff5f6] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#be185d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-stone-600">Retrieving companion details...</p>
        </div>
      </div>
    );
  }

  // Determine state representations
  const isClaimed = !!pet.receiverUid;
  const isOwner = user && pet.receiverUid === user.uid;
  const showClaimLanding = !user || (!isOwner && !isClaimed);

  // Visual pet animations based on state
  let petVisual = ANIMAL_EMOJIS[pet.petType] || "🐱";
  let statusText = "Healthy & Happy";
  let statusColor = "#10b981";
  let petBubble = "🐾 Tap buttons to interact with me!";

  if (pet.status === "runaway") {
    petVisual = "⛺";
    statusText = "Ran Away";
    statusColor = "#ef4444";
    petBubble = `${pet.petName} felt neglected and ran away back to ${pet.senderName}'s yard!`;
  } else if (pet.status === "sick") {
    petVisual = "🤒";
    statusText = "Sick & Neglected";
    statusColor = "#f59e0b";
    petBubble = "Sniff... I feel sick and neglected. Please feed or pet me!";
  } else if (pet.hunger <= 30) {
    petVisual = "🥺";
    statusText = "Very Hungry";
    statusColor = "#f59e0b";
    petBubble = "I'm hungry! Can you feed me some treats?";
  } else if (pet.attention <= 30) {
    petVisual = "🥺";
    statusText = "Lonely";
    statusColor = "#f59e0b";
    petBubble = "I'm feeling lonely. Let's play or talk!";
  } else {
    // Healthy reactions
    petVisual = ANIMAL_EMOJIS[pet.petType] || "🐱";
  }

  return (
    <div className="pet-dash-root min-h-screen pb-20 bg-[#fff5f6] font-sans flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Manrope:wght@400;500;600;700;800&display=swap');
        
        .pet-dash-root {
          font-family: 'Manrope', sans-serif;
          color: #3e2723;
        }

        .font-serif-playfair {
          font-family: 'Playfair Display', serif;
        }

        .pd-card {
          background: #ffffff;
          box-shadow: 0 10px 40px rgba(228, 141, 156, 0.15);
          border: 1px solid rgba(228, 141, 156, 0.2);
        }

        .stat-bar-bg {
          background: #f1ede8;
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease, background-color 0.3s;
        }

        .bubble-box {
          background: #fff5f6;
          border: 1px solid rgba(190, 24, 93, 0.15);
          position: relative;
        }

        .bubble-box::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0;
          border-style: solid;
          border-color: #fff5f6 transparent;
          display: block;
          width: 0;
        }

        .pd-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0.85rem 1.25rem;
          border-radius: 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .pd-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .pd-btn-feed {
          background: #fff3c7;
          color: #b45309;
        }

        .pd-btn-play {
          background: #d1fae5;
          color: #065f46;
        }

        .pd-btn-talk {
          background: #e0e7ff;
          color: #3730a3;
        }

        .pd-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .pet-bounce {
          animation: petBounce 1.8s infinite ease-in-out;
        }

        @keyframes petBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .login-btn {
          background: #ffffff;
          color: #3e2723;
          border: 1.5px solid rgba(123, 84, 85, 0.25);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .login-btn:hover {
          background: #fff5f6;
          border-color: #be185d;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-solid border-stone-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8" />
          <div className="flex items-center gap-3">
            {user && (
              <button onClick={handleLogout} className="text-xs font-bold text-stone-500 hover:text-stone-700 bg-none border-none cursor-pointer">
                Logout ({user.displayName?.split(" ")[0]})
              </button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="w-full max-w-xl px-4 mt-8">
        
        {/* ── CASE A: Claim Landing Screen (Unauthenticated or Unclaimed) ── */}
        {showClaimLanding && (
          <div className="pd-card rounded-[2.5rem] p-8 md:p-10 text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#be185d] opacity-80 block mb-2">
              Virtual Gift Package
            </span>
            <h1 className="font-serif-playfair text-3xl font-bold text-[#3e2723] mb-4">
              You Received a Pet!
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed mb-6 max-w-md mx-auto">
              <strong>{pet.senderName}</strong> sent you an adorable digital pet companion named <strong>{pet.petName}</strong>! Log in with Google to claim ownership and begin caring for them.
            </p>

            <div className="bg-[#fff9fa] rounded-2xl p-6 border border-dashed border-[#e48d9c]/30 max-w-sm mx-auto mb-8 text-center flex flex-col items-center gap-3">
              <span className="text-6xl pet-bounce">📦</span>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Inside the box</p>
                <p className="font-extrabold text-sm text-[#3e2723]">{pet.petName} ({pet.petType})</p>
              </div>
            </div>

            {error && (
              <div className="bg-[#fff2f2] text-[#be185d] p-3.5 rounded-xl text-xs font-bold border border-solid border-[#fee2e2] mb-4">
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleGoogleLogin} className="pd-btn login-btn w-full max-w-xs mx-auto flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign In with Google to Adopt
            </button>
          </div>
        )}

        {/* ── CASE B: Authenticated & Registered Playground ── */}
        {user && !showClaimLanding && (
          <div className="flex flex-col gap-6">
            
            {/* Owner mismatch warning */}
            {pet.receiverUid && pet.receiverUid !== user.uid ? (
              <div className="pd-card rounded-[2.5rem] p-8 text-center">
                <span className="text-4xl block mb-4">⛔</span>
                <h2 className="text-lg font-bold text-stone-800 mb-2">Access Denied</h2>
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  This pet belongs to another user. If this is your pet, please log out and sign in using the correct Google Account.
                </p>
                <button onClick={handleLogout} className="pd-btn login-btn">
                  Logout Account
                </button>
              </div>
            ) : (
              <>
                {/* Main Pet Playroom Box */}
                <div className="pd-card rounded-[2.5rem] p-6 md:p-8 text-center relative overflow-hidden">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between mb-8 border-b border-solid border-stone-100 pb-4">
                    <div className="text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Pet Name</span>
                      <p className="font-extrabold text-base text-[#3e2723]">{pet.petName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Status</span>
                      <p className="font-extrabold text-sm flex items-center gap-1.5" style={{ color: statusColor }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
                        {statusText}
                      </p>
                    </div>
                  </div>

                  {/* Speech Bubble */}
                  <div className="bubble-box rounded-2xl p-4 max-w-sm mx-auto mb-6 text-xs text-[#be185d] font-bold leading-normal">
                    {petBubble}
                  </div>

                  {/* Character Visual */}
                  <div className="text-[6.5rem] leading-none select-none my-6 pet-bounce h-28 flex items-center justify-center">
                    {petVisual}
                  </div>

                  {/* ── Stats Display ── */}
                  <div className="flex flex-col gap-4 max-w-md mx-auto my-8 text-left">
                    
                    {/* Hunger Stat */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-500">
                        <span>🍗 Hunger (Fullness)</span>
                        <span style={{ color: pet.hunger <= 30 ? "#ef4444" : "#3e2723" }}>{pet.hunger}%</span>
                      </div>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill"
                          style={{
                            width: `${pet.hunger}%`,
                            backgroundColor: pet.hunger <= 30 ? "#ef4444" : pet.hunger <= 70 ? "#f59e0b" : "#10b981",
                          }}
                        />
                      </div>
                    </div>

                    {/* Attention Stat */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-500">
                        <span>🎾 Mood / Attention</span>
                        <span style={{ color: pet.attention <= 30 ? "#ef4444" : "#3e2723" }}>{pet.attention}%</span>
                      </div>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill"
                          style={{
                            width: `${pet.attention}%`,
                            backgroundColor: pet.attention <= 30 ? "#ef4444" : pet.attention <= 70 ? "#f59e0b" : "#10b981",
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  {error && (
                    <div className="bg-[#fff2f2] text-[#be185d] p-3.5 rounded-xl text-xs font-bold border border-solid border-[#fee2e2] mb-6">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* ── Interactive Actions ── */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleAction("feed")}
                      disabled={isPerforming || pet.status === "runaway"}
                      className="pd-btn pd-btn-feed"
                      title="Feed Pet"
                    >
                      🍗 Feed
                    </button>
                    <button
                      onClick={() => handleAction("play")}
                      disabled={isPerforming || pet.status === "runaway"}
                      className="pd-btn pd-btn-play"
                      title="Play & Pet"
                    >
                      🎾 Play
                    </button>
                    <button
                      onClick={() => handleAction("talk")}
                      disabled={isPerforming || pet.status === "runaway"}
                      className="pd-btn pd-btn-talk"
                      title="Talk to Pet"
                    >
                      💬 Talk
                    </button>
                  </div>

                </div>

                {/* Sender Greeting note */}
                <div className="bg-white rounded-3xl p-6 border border-solid border-[#e48d9c]/20 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block mb-2">
                    Card Note from {pet.senderName}
                  </span>
                  <p className="text-xs italic text-stone-600 leading-relaxed font-serif-playfair">
                    "{pet.message || "I adopted this little friend to bring a smile to your face! Keep them fed and healthy!"}"
                  </p>
                </div>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
