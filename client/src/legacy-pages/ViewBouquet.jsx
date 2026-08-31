import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import RecipientBouquetCanvas from "../components/RecipientBouquetCanvas";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { applySeo, seoKeywords } from "../lib/seo";
import MusicPlayer from "../components/MusicPlayer";

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
    border: 1px solid rgba(255,255,255,0.85);
    width: 340px;
    max-width: 100%;
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

  /* ─── Hanging Tag ─── */
  @keyframes gentleSway {
    0%, 100% { transform: rotate(-3deg); }
    50%      { transform: rotate(1deg); }
  }
  .vb-hanging-tag-container {
    position: absolute;
    bottom: -2.5rem;
    right: -1rem;
    z-index: 120;
    transform-origin: top center;
    transform: translateZ(0);
    animation: gentleSway 6s ease-in-out infinite;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 160px;
  }
  .vb-tag-string {
    position: absolute;
    top: -45px;
    z-index: -1;
  }
  .vb-hanging-tag {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(200,130,140,0.18);
    border-radius: 14px;
    padding: 1.25rem 1rem;
    box-shadow: 0 12px 28px rgba(166, 93, 93, 0.12);
    position: relative;
    z-index: 121;
    text-align: left;
  }
  .vb-tag-hole {
    width: 6px; height: 6px;
    background: rgba(200,130,140,0.25);
    border-radius: 50%;
    position: absolute;
    top: 6px; left: 50%; transform: translateX(-50%);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  }
  .vb-note-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.95rem; line-height: 1.6;
    color: #3E2723;
    font-style: italic;
    word-break: break-word;
    margin-top: 0.2rem;
  }

  /* ─── Sender ─── */
  .vb-sender {
    text-align: center;
    margin-top: 1rem;
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
          let snapshot;
          try {
            snapshot = await getDocFromServer(doc(db, "bouquets", id));
          } catch (serverError) {
            console.warn("Server fetch failed, falling back to cached Firestore read.", serverError);
            snapshot = await getDoc(doc(db, "bouquets", id));
          }

          if (snapshot.exists()) {
            if (!cancelled) {
              setShared(snapshot.data());
              setIsLoading(false);
            }
            return;
          }
        }

        // Firebase had no document — fall back to localStorage (paid links saved locally)
        if (!cancelled) setShared(localData);
      } catch (error) {
        console.warn("Firebase read failed, using local data:", error.message);
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

  /* ── Loading ── */
  if (isLoading) {
    return (
      <main className="vb-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <FloatingDecorations />
        <div className="vb-state-card envelope-reveal er-1">
          <div className="vb-spinner" />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 500, color: "#3d3028" }}>
            {isPH ? "Binubuksan ang iyong bouquet…" : t("viewBouquet.unwrapping", "Unwrapping your bouquet…")}
          </p>
          <p style={{ fontSize: "0.82rem", color: "#a65d5d", marginTop: "0.5rem" }}>
            {isPH ? "May espesyal na taong gumawa nito para sa'yo ✨" : t("viewBouquet.someoneSpecialMade", "Someone special made this for you ✨")}
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
            {isPH ? (
              <>May nagpadala sa'yo ng<br /><em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>bulaklak</em> 🌸</>
            ) : (
              <>{t("viewBouquet.someoneSentYouPrefix", "Someone sent you")}<br /><em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>{t("viewBouquet.flowers", "flowers")}</em> 🌸</>
            )}
          </h1>
        </div>

        {/* ── Bouquet display with hanging tag ── */}
        <div className="vb-bouquet-card envelope-reveal er-2" style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
          
          <div className="vb-canvas-wrap">
            <RecipientBouquetCanvas stems={shared.stems} />
          </div>

          {/* ── Note card hanging gracefully ── */}
          {shared.note?.trim() && (
            <div className="vb-hanging-tag-container" style={{ animationDelay: "0.5s" }}>
              <svg className="vb-tag-string" width="40" height="60" viewBox="0 0 40 60" fill="none">
                 <path d="M 20 0 Q 30 20, 20 60" stroke="rgba(123,84,85,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
              <div className="vb-hanging-tag">
                <div className="vb-tag-hole"></div>
                <p className="vb-note-text">
                  "{shared.note}"
                </p>
              </div>
            </div>
          )}

          {/* ── Sender attribution ── */}
          <div className="vb-sender envelope-reveal er-4">
            <p className="vb-sender-line">
              {isPH ? "Ginawa nang may " : t("viewBouquet.craftedWith", "Crafted with ")}
              <span style={{ color: "#e25555", margin: "0 3px" }}>♥</span>
              {isPH ? " ni " : ` ${t("viewBouquet.by", "by")} `}
              <span className="vb-sender-name">{senderName}</span>
            </p>
          </div>
        </div>

        {/* ── Viral CTA ── */}
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

        {/* ── Branding ── */}
        <div className="vb-branding envelope-reveal er-5">
          <p className="vb-branding-logo">{t("common.logo", "petals & words")}</p>
        </div>

      </div>
    </main>
  );
}

