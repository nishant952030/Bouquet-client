import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import PlushieScene from "../components/plushie3d/PlushieScene.jsx";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { applySeo } from "../lib/seo";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&family=Manrope:wght@400;500;600;700;800&display=swap');

  .vp-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%);
    font-family: 'Manrope', sans-serif;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    position: relative;
    overflow: hidden;
  }

  .vp-wrap {
    width: min(960px, 100%);
    display: grid;
    gap: 1rem;
    justify-items: center;
    position: relative;
    z-index: 5;
  }

  .vp-title {
    text-align: center;
    z-index: 2;
  }

  .vp-title h1 {
    font-family: 'Caveat', cursive;
    font-size: clamp(2.5rem, 9vw, 4.5rem);
    line-height: 1;
    margin: 0 0 0.5rem;
    text-shadow: 0 8px 24px rgba(0,0,0,0.4);
    color: #fce7f3;
  }

  .vp-canvas-box {
    width: min(720px, 100%);
    height: min(62vh, 520px);
    min-height: 360px;
    border-radius: 24px;
    box-shadow: 0 24px 70px rgba(0,0,0,0.45);
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .vp-hint {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    pointer-events: none;
    font-weight: 800;
    font-size: 0.95rem;
    color: #be185d;
    background: rgba(255, 255, 255, 0.85);
    padding: 0.5rem 1.2rem;
    border-radius: 99px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    animation: float 2.5s infinite ease-in-out;
  }

  @keyframes float {
    0%, 100% { transform: translate(-50%, 0); }
    50% { transform: translate(-50%, -6px); }
  }

  .note-card {
    position: absolute;
    top: 52%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
    width: 90%;
    max-width: 380px;
    background: linear-gradient(145deg, #ffffff 0%, #fff1f2 100%);
    border-radius: 1.5rem;
    padding: 2.2rem 1.8rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
    text-align: center;
    animation: noteRise 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .note-close {
    position: absolute;
    top: 14px;
    right: 18px;
    background: none;
    border: none;
    font-size: 1.3rem;
    color: #be185d;
    cursor: pointer;
    font-weight: bold;
  }

  .note-to {
    font-family: 'Caveat', cursive;
    font-size: 2.1rem;
    color: #be185d;
    margin: 0 0 0.8rem;
    line-height: 1;
  }

  .note-text {
    font-family: 'Patrick Hand', cursive;
    font-size: 1.45rem;
    color: #3f2f32;
    line-height: 1.45;
    margin-bottom: 1.2rem;
    white-space: pre-wrap;
  }

  .note-from {
    font-family: 'Caveat', cursive;
    font-size: 1.8rem;
    color: #be185d;
    margin: 0;
    line-height: 1;
  }

  @keyframes noteRise {
    from { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  .viral-cta {
    margin-top: 2rem;
    text-align: center;
    width: 100%;
    max-width: 320px;
  }

  .viral-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #be185d, #ec4899);
    color: #fff;
    padding: 0.85rem 1.5rem;
    border-radius: 99px;
    font-weight: 700;
    text-decoration: none;
    font-size: 0.9rem;
    box-shadow: 0 8px 24px rgba(190, 24, 93, 0.3);
    transition: transform 0.2s, background 0.2s;
    margin-bottom: 0.8rem;
  }

  .viral-btn:hover {
    transform: translateY(-2px);
  }

  .made-with-link {
    display: inline-block;
    color: #cbd5e1;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .made-with-link:hover {
    opacity: 1;
    color: #fda4af;
  }

  .confetti-piece {
    position: fixed;
    width: 10px;
    height: 20px;
    top: -20px;
    z-index: 90;
    opacity: 0;
    animation: fall var(--dur) linear forwards var(--delay);
  }

  @keyframes fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }

  @media (max-width: 540px) {
    .vp-root {
      padding: 0.5rem;
      align-items: flex-start;
      padding-top: 2rem;
    }

    .vp-wrap {
      gap: 0.5rem;
    }

    .vp-title h1 {
      font-size: 2.4rem;
    }

    .vp-canvas-box {
      height: 400px;
    }

    .note-card {
      width: 92%;
      padding: 1.5rem 1.2rem;
    }

    .note-to { font-size: 1.8rem; }
    .note-text { font-size: 1.2rem; }
    .note-from { font-size: 1.5rem; }
  }
`;

function getSharedPlushieFromLocalStorage(id) {
  try {
    const raw = localStorage.getItem(`plushie_share_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Confetti() {
  const colors = ["#f43f5e", "#ec4899", "#d946ef", "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#eab308", "#f97316"];
  const [pieces] = useState(() =>
    Array.from({ length: 65 }, (_, index) => (
      <div
        className="confetti-piece"
        key={index}
        style={{
          left: `${Math.random() * 100}vw`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          "--dur": `${1.8 + Math.random() * 2.5}s`,
          "--delay": `${Math.random() * 0.8}s`,
          borderRadius: Math.random() > 0.55 ? "50%" : "0",
          width: `${6 + Math.random() * 7}px`,
          height: `${6 + Math.random() * 14}px`,
        }}
      />
    ))
  );

  return <>{pieces}</>;
}

export default function ViewPlushie() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPlushie = async () => {
      // Priority 1: Check fallback payload in query parameter
      const paramData = searchParams.get("data") || searchParams.get("card");
      if (paramData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(paramData.replace(/ /g, "+")))));
          if (!cancelled) {
            setData(decoded);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Query param decoding failed, falling back to Firebase:", e);
        }
      }

      if (!id) {
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
        return;
      }

      // Priority 2: Check Firebase DB
      try {
        if (isFirebaseConfigured && db) {
          let snapshot;
          try {
            snapshot = await getDocFromServer(doc(db, "plushies", id));
          } catch (serverError) {
            console.warn("Server fetch failed, falling back to Firestore cache:", serverError);
            snapshot = await getDoc(doc(db, "plushies", id));
          }

          if (snapshot.exists()) {
            if (!cancelled) {
              setData(snapshot.data());
              setIsLoading(false);
            }
            return;
          }
        }

        // Priority 3: Check local storage
        const localData = getSharedPlushieFromLocalStorage(id);
        if (!cancelled) {
          if (localData) setData(localData);
          else setError(true);
        }
      } catch (err) {
        console.error("Unable to read shared plushie:", err);
        const localData = getSharedPlushieFromLocalStorage(id);
        if (!cancelled) {
          if (localData) setData(localData);
          else setError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPlushie();
    return () => { cancelled = true; };
  }, [id, searchParams]);

  useEffect(() => {
    if (!data) return;
    const nameStr = data.to ? `for ${data.to}` : "for you";
    applySeo({
      title: `A Plushie Gift ${nameStr}! | Petals and Words`,
      description: "Open your custom 3D plushie gift and message tag.",
      path: `/plushie/${id || ""}`,
      robots: "noindex,nofollow"
    });
  }, [data, id]);

  const handleOpenBox = () => {
    if (isOpen) return;
    setIsOpen(true);
    // Delay displaying the tag card until after the box finishes opening
    setTimeout(() => {
      setShowNote(true);
    }, 1100);
  };

  if (isLoading) {
    return (
      <div className="vp-root" style={{ flexDirection: "column" }}>
        <p style={{ fontSize: "1.5rem" }}>🎁</p>
        <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Unwrapping your surprise...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="vp-root">
        <style>{CSS}</style>
        <div style={{ textAlign: "center", maxWidth: 360, background: "rgba(255,255,255,0.08)", padding: "2rem", borderRadius: "1.5rem", backdropFilter: "blur(10px)" }}>
          <p style={{ fontSize: "2.5rem", margin: 0 }}>🧸</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", margin: "1rem 0 0.5rem" }}>Gift Not Found</h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "1.5rem" }}>This link might be expired or incorrect, but you can build a new one!</p>
          <Link to="/create-plushie" className="viral-btn" style={{ margin: "0 auto" }}>Create a Plushie 🧸</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-root">
      <style>{CSS}</style>
      
      {isOpen && <Confetti />}

      <div className="vp-wrap">
        {/* Nav */}
        <header style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem" }}>
          <img src="/logo-transparent.png" alt="Logo" style={{ height: 26 }} />
          <LanguageSwitcher />
        </header>

        {/* Title */}
        <div className="vp-title">
          <h1>{data.to ? `For ${data.to}` : "A Gift For You"}</h1>
        </div>

        {/* 3D Canvas Box */}
        <div className="vp-canvas-box" onClick={handleOpenBox} style={{ cursor: isOpen ? "default" : "pointer" }}>
          <PlushieScene
            plushieType={data.plushieType}
            furColor={data.furColor}
            accessory={data.accessory}
            boxStyle={data.boxStyle}
            isOpen={isOpen}
            autoRotate={isOpen} // Spin slowly once opened
          />

          {!isOpen && (
            <div className="vp-hint">
              {t("plushie.boxOpen", "Tap the box to open 🎁")}
            </div>
          )}

          {/* Letter Overlay */}
          {showNote && (
            <div className="note-card">
              <button className="note-close" onClick={() => setShowNote(false)}>×</button>
              {data.to && <h3 className="note-to">Dear {data.to},</h3>}
              <p className="note-text">{data.msg}</p>
              {data.from && <h4 className="note-from">— With love, {data.from}</h4>}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="viral-cta">
          {isOpen && !showNote && (
            <button className="viral-btn" onClick={() => setShowNote(true)} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", width: "100%", maxWidth: "none" }}>
              💌 Read Card Tag
            </button>
          )}
          
          <Link to="/create-plushie" className="viral-btn">
            🧸 Make a plushie for someone
          </Link>
          <Link to="/create" className="viral-btn" style={{ background: "transparent", border: "1.5px solid rgba(244,114,182,0.6)", color: "#fbcfe8", boxShadow: "none" }}>
            💐 Send a flower bouquet
          </Link>

          <Link to="/" className="made-with-link">
            {t("common.madeWith", "Made with Petals & Words")}
          </Link>
        </div>
      </div>
    </div>
  );
}
