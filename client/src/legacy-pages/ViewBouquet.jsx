import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import RecipientBouquetCanvas from "../components/RecipientBouquetCanvas";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { applySeo, seoKeywords } from "../lib/seo";
import MusicPlayer from "../components/MusicPlayer";
import VoiceNotePlayer from "../components/VoiceNotePlayer";

/* ── helpers ── */
function getSharedBouquetFromLocalStorage(id) {
  try {
    const raw = localStorage.getItem(`bouquet_share_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .vb-root {
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
    background: linear-gradient(160deg, #fdf6f0 0%, #f8edf0 55%, #fdf0f5 100%);
    color: #1b1c1a;
    overflow-x: hidden;
    position: relative;
  }

  /* ─── Envelope reveal ─── */
  @keyframes envelopeOpen {
    0%   { opacity: 0; transform: translateY(22px) scale(0.97); }
    70%  { transform: translateY(-4px) scale(1.01); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .envelope-reveal {
    animation: envelopeOpen 0.65s cubic-bezier(0.34,1.3,0.64,1) forwards;
    opacity: 0;
  }
  .er-1 { animation-delay: 0.1s; }
  .er-2 { animation-delay: 0.3s; }
  .er-3 { animation-delay: 0.5s; }
  .er-4 { animation-delay: 0.7s; }
  .er-5 { animation-delay: 0.9s; }

  /* ─── Header ─── */
  .vb-header {
    text-align: center;
    position: relative;
    z-index: 1;
  }

  /* ─── Bouquet Area ─── */
  .vb-bouquet-card {
    position: relative;
    z-index: 1;
    isolation: isolate;
    overflow: visible;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .vb-canvas-wrap {
    border-radius: 1.75rem;
    overflow: hidden;
    background: rgba(255,248,242,0.85);
    backdrop-filter: blur(12px);
    position: relative;
    box-shadow: 0 20px 50px rgba(166, 93, 93, 0.14), 0 4px 12px rgba(166,93,93,0.08);
    border: 1.5px solid rgba(255,255,255,0.9);
    width: 370px;
    max-width: 94vw;
    z-index: 1;
  }

  /* Keep Fabric canvas layers below the hanging note tag */
  .vb-canvas-wrap .canvas-container,
  .vb-canvas-wrap .lower-canvas,
  .vb-canvas-wrap .upper-canvas {
    position: relative !important;
    z-index: 1 !important;
  }

  /* decorative corner sparkles inside canvas */
  .vb-canvas-wrap::before,
  .vb-canvas-wrap::after {
    position: absolute; pointer-events: none; z-index: 2;
    font-size: 1.1rem;
  }
  .vb-canvas-wrap::before {
    content: '✨'; top: 8px; left: 10px;
    animation: floatSparkle 2.5s ease-in-out infinite;
  }
  .vb-canvas-wrap::after {
    content: '💕'; bottom: 8px; right: 10px;
    animation: floatSparkle 3s ease-in-out infinite 0.5s;
  }

  /* ─── Interactive Gift Tag on Bouquet ─── */
  @keyframes tagBob {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50%      { transform: translateY(-5px) rotate(1deg); }
  }
  @keyframes tagGlow {
    0%, 100% { box-shadow: 0 4px 14px rgba(228, 141, 156, 0.35); }
    50%      { box-shadow: 0 8px 24px rgba(228, 141, 156, 0.65); }
  }
  .vb-interactive-tag {
    position: absolute;
    bottom: 14px;
    right: 14px;
    z-index: 15;
    background: linear-gradient(135deg, #ffffff 0%, #fff2f5 100%);
    border: 1.5px solid rgba(228, 141, 156, 0.55);
    border-radius: 9999px;
    padding: 0.45rem 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    animation: tagBob 4s ease-in-out infinite, tagGlow 3s ease-in-out infinite;
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 6px 18px rgba(166, 93, 93, 0.16);
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
  .vb-interactive-tag:hover {
    transform: scale(1.06) rotate(0deg);
  }
  .vb-interactive-tag:active {
    transform: scale(0.95);
  }
  .vb-tag-emoji {
    font-size: 1.05rem;
    line-height: 1;
  }
  .vb-tag-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.76rem;
    font-weight: 800;
    color: #7c3f4f;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .vb-tag-sparkle {
    font-size: 0.82rem;
    color: #f59e0b;
  }

  /* ─── Envelope / Card Reveal Modal (Spring Unfold) ─── */
  .vb-card-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 250;
    background: rgba(38, 24, 27, 0.48);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    animation: fadeInBackdrop 0.25s ease both;
  }
  @keyframes fadeInBackdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .vb-unfolded-card {
    width: 100%;
    max-width: 400px;
    background: linear-gradient(180deg, #ffffff 0%, #fffdfa 55%, #fff7f4 100%);
    border: 1.5px solid rgba(228, 141, 156, 0.45);
    border-radius: 1.75rem;
    padding: 1.6rem 1.4rem 1.4rem;
    box-shadow: 0 24px 60px rgba(124, 63, 79, 0.28), 0 4px 16px rgba(0,0,0,0.06);
    position: relative;
    box-sizing: border-box;
    animation: unfoldCard 0.35s cubic-bezier(0.34, 1.25, 0.64, 1) both;
    transform-origin: bottom center;
  }
  @keyframes unfoldCard {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.9) rotate(-1.5deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(0deg);
    }
  }

  .vb-card-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.1rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px dashed rgba(228, 141, 156, 0.35);
  }
  .vb-card-seal-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vb-card-seal {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #ffd9d8 0%, #ffcad4 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    box-shadow: 0 3px 8px rgba(166, 93, 93, 0.15);
  }
  .vb-card-seal-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.74rem;
    font-weight: 800;
    color: #7c3f4f;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .vb-card-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(200, 130, 140, 0.12);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #7c3f4f;
    font-size: 0.95rem;
    transition: background 0.15s, transform 0.15s;
    outline: none;
  }
  .vb-card-close-btn:hover {
    background: rgba(200, 130, 140, 0.25);
    transform: scale(1.08);
  }

  .vb-card-body-scroll {
    max-height: min(52vh, 380px);
    overflow-y: auto;
    padding: 0.25rem 0.5rem;
    margin: 0 -0.25rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(200, 130, 140, 0.35) transparent;
  }
  .vb-card-note-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    line-height: 1.75;
    color: #382425;
    font-style: italic;
    word-break: break-word;
    white-space: pre-wrap;
    text-align: center;
    margin: 0;
  }

  .vb-card-signature {
    margin-top: 1.15rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(228, 141, 156, 0.25);
    text-align: center;
  }

  .vb-card-return-btn {
    width: 100%;
    margin-top: 0.85rem;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    padding: 0.7rem 1.25rem;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(124, 63, 79, 0.25);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .vb-card-return-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 26px rgba(124, 63, 79, 0.35);
  }

  /* ─── Sender ─── */
  .vb-sender {
    text-align: center;
    position: relative; z-index: 1;
  }
  .vb-sender-line { font-size: 0.8rem; color: #6b5e5f; }
  .vb-sender-name {
    font-weight: 700; color: #a65d5d;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 1.05rem;
  }

  /* ─── CTA ─── */
  .vb-cta-section {
    text-align: center;
    position: relative; z-index: 1;
    margin-top: 3.5rem;
  }
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .vb-cta-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.85rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    border: none; border-radius: 9999px;
    padding: 0 2rem; min-height: 54px;
    cursor: pointer;
    text-decoration: none;
    animation: pw-pulse 2.5s infinite;
    transition: transform 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .vb-cta-btn:hover { transform: translateY(-2px) scale(1.02); }
  .vb-cta-btn:active { transform: scale(0.98); }
  .vb-cta-sub {
    font-size: 0.75rem; color: #b8a9aa;
    margin-top: 0.75rem;
  }

  /* ─── Branding ─── */
  .vb-branding {
    text-align: center;
    position: relative; z-index: 1;
    margin-top: 2rem;
  }
  .vb-branding-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.9rem; font-style: italic;
    color: #9e8f90;
    letter-spacing: 0.12em;
  }

  /* ─── Floating decorations ─── */
  @keyframes floatHeart {
    0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
    15%  { opacity: 0.7; }
    85%  { opacity: 0.5; }
    100% { transform: translateY(-100vh) rotate(25deg) scale(0.6); opacity: 0; }
  }
  @keyframes floatPetal {
    0%   { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
    10%  { opacity: 0.6; }
    50%  { transform: translateY(-50vh) rotate(180deg) translateX(30px); }
    90%  { opacity: 0.4; }
    100% { transform: translateY(-100vh) rotate(360deg) translateX(-20px); opacity: 0; }
  }
  @keyframes floatSparkle {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50%      { opacity: 0.8; transform: scale(1.2); }
  }

  .float-heart {
    position: fixed; pointer-events: none; z-index: 0;
    animation: floatHeart linear infinite;
    font-size: 1rem; color: #ffd9d8;
  }
  .float-petal {
    position: fixed; pointer-events: none; z-index: 0;
    animation: floatPetal linear infinite;
    font-size: 0.85rem;
  }
  .float-sparkle {
    position: fixed; pointer-events: none; z-index: 0;
    animation: floatSparkle ease-in-out infinite;
    font-size: 0.75rem;
  }

  /* ─── Loading / Error ─── */
  .vb-state-card {
    background: transparent;
    text-align: center;
    max-width: 380px;
    margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .vb-spinner {
    width: 44px; height: 44px;
    border: 3px solid rgba(200,130,140,0.15);
    border-top-color: #a65d5d;
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 0.8s linear infinite;
  }
`;

/* ── Floating decoration generator ── */
function FloatingDecorations() {
  const [elements] = useState(() => {
    const arr = [];
    const hearts = ["💕", "💗", "💖", "🩷", "🤍"];
    const petals = ["🌸", "🌺", "🌷", "🪻", "🌹"];
    const sparkles = ["✨", "⭐", "💫"];

    for (let i = 0; i < 6; i++) {
      arr.push(
        <span key={`h${i}`} className="float-heart" style={{
          left: `${8 + Math.random() * 84}%`,
          bottom: `-${20 + Math.random() * 40}px`,
          animationDuration: `${8 + Math.random() * 6}s`,
          animationDelay: `${Math.random() * 8}s`,
          fontSize: `${0.7 + Math.random() * 0.6}rem`,
        }}>{hearts[i % hearts.length]}</span>
      );
    }
    for (let i = 0; i < 5; i++) {
      arr.push(
        <span key={`p${i}`} className="float-petal" style={{
          left: `${5 + Math.random() * 90}%`,
          bottom: `-${10 + Math.random() * 30}px`,
          animationDuration: `${10 + Math.random() * 8}s`,
          animationDelay: `${Math.random() * 10}s`,
          fontSize: `${0.6 + Math.random() * 0.5}rem`,
        }}>{petals[i % petals.length]}</span>
      );
    }
    for (let i = 0; i < 4; i++) {
      arr.push(
        <span key={`s${i}`} className="float-sparkle" style={{
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
          animationDuration: `${3 + Math.random() * 3}s`,
          animationDelay: `${Math.random() * 4}s`,
        }}>{sparkles[i % sparkles.length]}</span>
      );
    }
    return arr;
  });

  return <>{elements}</>;
}

/* ── MAIN COMPONENT ── */
export default function ViewBouquet() {
  const { id: rawId } = useParams();
  const { t } = useTranslation();
  // Bouquet IDs are Date.now() (13 digits) + base36 random (4-8 chars),
  // so they only contain [a-z0-9]. Strip anything after the first non-ID
  // character (spaces, slashes, encoded chars, appended text, etc.).
  const id = rawId ? rawId.match(/^[a-z0-9]+/i)?.[0] || rawId : rawId;
  const [shared, setShared] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsNoteOpen(false);
    };
    if (isNoteOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isNoteOpen]);

  useEffect(() => {
    applySeo({
      title: shared?.senderName ? `${shared.senderName} sent you flowers! 💐` : "Someone sent you flowers! 💐",
      description: shared?.note ? `"${shared.note.slice(0, 90)}..." — Sent by ${shared.senderName || 'someone special'}` : "Open and read a heartfelt digital flower bouquet with a personal note crafted just for you.",
      keywords: seoKeywords.view,
      path: id ? `/view/${id}` : "/view",
      ogNote: shared?.note || "",
      ogSender: shared?.senderName || "",
      ogCount: shared?.stems?.length || 7,
      ogType: "bouquet",
      robots: "noindex,nofollow",
    });
  }, [id, shared]);

  useEffect(() => {
    let cancelled = false;

    const loadSharedBouquet = async () => {
      if (!id) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Check localStorage first — preview bouquets (isPreview: true) are only
      // stored locally, so we skip Firebase entirely to avoid permission errors.
      const localData = getSharedBouquetFromLocalStorage(id);
      if (localData?.isPreview) {
        if (!cancelled) {
          setShared(localData);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isFirebaseConfigured && db) {
          let snapshot = null;
          try {
            snapshot = await getDocFromServer(doc(db, "bouquets", id));
          } catch (serverError) {
            // Only retry offline cache if not a permission denied error
            if (serverError?.code !== "permission-denied") {
              try {
                snapshot = await getDoc(doc(db, "bouquets", id));
              } catch {}
            }
          }

          if (snapshot && snapshot.exists()) {
            if (!cancelled) {
              setShared(snapshot.data());
              setIsLoading(false);
            }
            return;
          }
        }

        // Fallback to local storage (e.g. preview mode or local test)
        if (!cancelled) setShared(localData);
      } catch {
        if (!cancelled) setShared(localData);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSharedBouquet();
    return () => { cancelled = true; };
  }, [id]);

  const [country] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "Asia/Manila") return "PH";
    } catch {}
    return "GLOBAL";
  });
  const isPH = country === "PH";

  const isPreview = Boolean(
    shared?.isPreview ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1")
  );

  /* ── Loading ── */
  if (isLoading) {
    return (
      <main className="vb-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <FloatingDecorations />
        <div className="vb-state-card envelope-reveal er-1">
          <div className="vb-spinner" />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 500, color: "#3d3028" }}>
            {isPreview
              ? (isPH ? "Inihahanda ang preview ng iyong bouquet…" : "Preparing your bouquet preview…")
              : (isPH ? "Binubuksan ang iyong bouquet…" : t("viewBouquet.unwrapping", "Unwrapping your bouquet…"))}
          </p>
          <p style={{ fontSize: "0.82rem", color: "#a65d5d", marginTop: "0.5rem" }}>
            {isPreview
              ? (isPH ? "Silipin ang makikita ng iyong recipient ✨" : "See what your recipient will experience ✨")
              : (isPH ? "May espesyal na taong gumawa nito para sa'yo ✨" : t("viewBouquet.someoneSpecialMade", "Someone special made this for you ✨"))}
          </p>
        </div>
      </main>
    );
  }

  /* ── Not found ── */
  if (!shared) {
    return (
      <main className="vb-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <div className="vb-state-card envelope-reveal er-1">
          <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🥀</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, color: "#3d3028", marginBottom: "0.5rem" }}>
            {isPH ? "Hindi nahanap ang bouquet" : t("viewBouquet.bouquetNotFound", "Bouquet not found")}
          </p>
          <p style={{ fontSize: "0.82rem", color: "#705f58", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            {isPH ? "Maaaring expired o mali ang link na ito." : t("viewBouquet.invalidLink", "This link may be invalid or expired.")}<br />
            {isPH ? "Ngunit maaari kang gumawa ng bago!" : t("viewBouquet.createFresh", "But you can always create a fresh one!")}
          </p>
          <Link to="/" className="vb-cta-btn" style={{ display: "inline-flex" }}>
            {isPH ? "Gumawa ng Bouquet 💐" : t("viewBouquet.createBouquet", "Create a Bouquet 💐")}
          </Link>
        </div>
      </main>
    );
  }

  const senderName = shared.senderName?.trim() || (isPH ? "isang espesyal na tao" : t("viewBouquet.someoneSpecial", "someone special"));

  /* ── Main view ── */
  return (
    <main className="vb-root" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <style>{CSS}</style>
      <FloatingDecorations />
      <MusicPlayer trackId={shared.musicTrack} />

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 1.25rem", overflow: "visible" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "1rem" }}>
          <LanguageSwitcher />
        </div>
        <div className="vb-header envelope-reveal er-1">
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2.3rem",
            fontWeight: 500,
            lineHeight: 1.15,
            marginTop: "1.25rem",
            color: "#3d3028",
          }}>
            {isPreview ? (
              <>{isPH ? "Preview ng iyong" : "Preview of your"}<br /><em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>bouquet</em> 🌸</>
            ) : isPH ? (
              <>May nagpadala sa'yo ng<br /><em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>bulaklak</em> 🌸</>
            ) : (
              <>{t("viewBouquet.someoneSentYouPrefix", "Someone sent you")}<br /><em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>{t("viewBouquet.flowers", "flowers")}</em> 🌸</>
            )}
          </h1>
        </div>

        {/* ── Personal Voice Note Banner (if sender recorded one) ── */}
        {shared.voiceNote && (
          <div className="envelope-reveal er-1" style={{ marginTop: "1.25rem", marginBottom: "-0.5rem" }}>
            <VoiceNotePlayer src={shared.voiceNote} senderName={senderName} isPH={isPH} variant="banner" />
          </div>
        )}

        {/* ── Bouquet display with interactive gift tag ── */}
        <div
          className="vb-bouquet-card envelope-reveal er-2"
          style={{
            marginTop: "1.5rem",
            transition: "transform 0.35s ease, filter 0.35s ease, opacity 0.35s ease",
            transform: isNoteOpen ? "scale(0.95)" : "scale(1)",
            filter: isNoteOpen ? "blur(3px) brightness(0.9)" : "none",
            opacity: isNoteOpen ? 0.6 : 1,
          }}
        >
          <div className="vb-canvas-wrap">
            <RecipientBouquetCanvas stems={shared.stems} />

            {/* Gift tag attached to the bouquet */}
            {shared.note?.trim() && (
              <button
                type="button"
                className="vb-interactive-tag"
                onClick={() => setIsNoteOpen(true)}
                title={isPH ? "Pindutin para basahin ang sulat" : "Tap to read personal note"}
              >
                <span className="vb-tag-emoji">💌</span>
                <span className="vb-tag-label">{isPH ? "Basahin ang sulat" : "Read your note"}</span>
                <span className="vb-tag-sparkle">✨</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Sender attribution below canvas in closed state ── */}
        <div className="vb-sender envelope-reveal er-4" style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
          <p className="vb-sender-line">
            {isPH ? "Ginawa nang may " : t("viewBouquet.craftedWith", "Crafted with ")}
            <span style={{ color: "#e25555", margin: "0 3px" }}>♥</span>
            {isPH ? " ni " : ` ${t("viewBouquet.by", "by")} `}
            <span className="vb-sender-name">{senderName}</span>
          </p>
        </div>

        {/* ── Envelope / Card Reveal Metaphor (Spring-Unfolded Note Card) ── */}
        {isNoteOpen && shared.note?.trim() && (
          <div
            className="vb-card-modal-backdrop"
            onClick={() => setIsNoteOpen(false)}
          >
            <div
              className="vb-unfolded-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar with seal & close button */}
              <div className="vb-card-topbar">
                <div className="vb-card-seal-group">
                  <div className="vb-card-seal">💌</div>
                  <span className="vb-card-seal-text">
                    {isPH ? "Liham para sa'yo" : "A Note for You"}
                  </span>
                </div>
                <button
                  type="button"
                  className="vb-card-close-btn"
                  onClick={() => setIsNoteOpen(false)}
                  aria-label="Close note"
                >
                  ✕
                </button>
              </div>

              {/* Voice Note player inside the letter if present */}
              {shared.voiceNote && (
                <div style={{ marginBottom: "1rem" }}>
                  <VoiceNotePlayer src={shared.voiceNote} senderName={senderName} isPH={isPH} variant="card" />
                </div>
              )}

              {/* Scrollable note text in clean readable serif font */}
              <div className="vb-card-body-scroll">
                <p className="vb-card-note-text">
                  "{shared.note}"
                </p>
              </div>

              {/* Sender signature */}
              <div className="vb-card-signature">
                <p className="vb-sender-line" style={{ margin: 0 }}>
                  {isPH ? "Ginawa nang may " : t("viewBouquet.craftedWith", "Crafted with ")}
                  <span style={{ color: "#e25555", margin: "0 3px" }}>♥</span>
                  {isPH ? " ni " : ` ${t("viewBouquet.by", "by")} `}
                  <span className="vb-sender-name">{senderName}</span>
                </p>
              </div>

              {/* Return to bouquet action */}
              <button
                type="button"
                className="vb-card-return-btn"
                onClick={() => setIsNoteOpen(false)}
              >
                🌸 {isPH ? "Tingnan ang Bouquet muli" : "Back to Bouquet"}
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom Section: Edit Button in Preview Mode, Viral CTAs in Recipient Mode ── */}
        {isPreview ? (
          <div className="vb-cta-section envelope-reveal er-5" style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link
              to="/create"
              className="vb-cta-btn"
              style={{
                width: "100%",
                maxWidth: "280px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%)",
                boxShadow: "0 10px 28px rgba(124,63,79,0.3)",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {isPH ? "I-edit ang Bouquet" : "Edit Bouquet"}
            </Link>
            <p className="vb-cta-sub" style={{ marginTop: "0.75rem", fontSize: "0.76rem", color: "#8a7670" }}>
              {isPH ? "✨ Preview Mode — Pindutin para baguhin ang mga bulaklak o note" : "✨ Preview Mode — Tap to change flowers or message"}
            </p>
          </div>
        ) : (
          <div className="vb-cta-section envelope-reveal er-5">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
              <Link to="/create?ref=bouquet_receiver" className="vb-cta-btn" style={{ width: "100%", maxWidth: "280px" }}>
                {isPH ? "Gumawa ng bouquet para sa iba 💐" : t("viewBouquet.makeBouquet", "Make a bouquet for someone 💐")}
              </Link>
              <Link to="/create-cake?ref=bouquet_receiver" className="vb-cta-btn" style={{ width: "100%", maxWidth: "280px", background: "linear-gradient(135deg, #d94a78 0%, #f0a23f 180%)" }}>
                {isPH ? "Magpadala ng 3D Birthday Cake 🎂" : t("viewBouquet.makeCake", "Send a 3D Birthday Cake 🎂")}
              </Link>
            </div>
            <p className="vb-cta-sub">
              {isPH ? "100% Libre, masaya, at nagpapangiti ✨" : t("viewBouquet.itsFree", "It's free, fun, and makes people smile ✨")}
            </p>
          </div>
        )}

        {/* ── Branding ── */}
        <div className="vb-branding envelope-reveal er-5">
          <p className="vb-branding-logo">{t("common.logo", "petals & words")}</p>
        </div>

      </div>
    </main>
  );
}

