import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applySeo, seoKeywords } from "../lib/seo";
import LanguageSwitcher from "../components/LanguageSwitcher";

/* ═══════════════════════════════════════════════════════════════════════════
   Mother's Day Card — Centered Envelope → Card Reveal
   - Supports customized content via ?card= base64 param
   - Larger premium card, dynamic CSS backgrounds, sticker decorations
   ═══════════════════════════════════════════════════════════════════════════ */

const PAPERS = {
  blush: { bg: "linear-gradient(175deg,#ffffff 0%,#fff5f7 40%,#fdf2f8 100%)", border: "rgba(212,175,55,0.2)" },
  cream: { bg: "linear-gradient(175deg,#fffdf7 0%,#fef9ef 40%,#fdf5e6 100%)", border: "rgba(180,150,80,0.2)" },
  lavender: { bg: "linear-gradient(175deg,#faf5ff 0%,#f3e8ff 40%,#ede9fe 100%)", border: "rgba(140,100,200,0.2)" },
  mint: { bg: "linear-gradient(175deg,#f0fdf4 0%,#ecfdf5 40%,#d1fae5 100%)", border: "rgba(60,160,120,0.2)" },
  gold: { bg: "linear-gradient(175deg,#fffbeb 0%,#fef3c7 40%,#fde68a 100%)", border: "rgba(180,130,30,0.25)" },
  white: { bg: "linear-gradient(175deg,#ffffff 0%,#fafafa 40%,#f5f5f5 100%)", border: "rgba(150,150,150,0.15)" },
};

const DECOS_MAP = {
  hearts: "💕", flowers: "🌸", sparkles: "✨", butterflies: "🦋", stars: "⭐", ribbons: "🎀"
};

const DECO_POSITIONS = [
  { top: "4%", left: "5%", rot: -15 }, { top: "6%", right: "6%", rot: 20 },
  { bottom: "8%", left: "4%", rot: 10 }, { bottom: "5%", right: "5%", rot: -10 },
  { top: "45%", left: "2%", rot: -25 }, { top: "40%", right: "3%", rot: 15 },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Manrope:wght@400;500;600;700&family=Great+Vibes&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ── PAGE ── */
  .md-page {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 30% 20%, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 60%, #f9a8d4 100%);
    padding: 1rem;
    overflow: hidden;
    position: relative;
    font-family: 'Manrope', sans-serif;
  }
  .md-page::after {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; mix-blend-mode: multiply; z-index: 1;
  }

  /* ── ENVELOPE ── */
  .envelope-scene {
    position: absolute;
    z-index: 10;
    display: flex; flex-direction: column; align-items: center;
    transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .envelope-scene.is-hidden {
    opacity: 0;
    transform: scale(0.6) translateY(40px);
    pointer-events: none;
  }

  .envelope {
    position: relative;
    background: linear-gradient(135deg, #fdfbf7, #f4eee1);
    box-shadow: 0 15px 40px rgba(150, 40, 70, 0.2), inset 0 0 40px rgba(0,0,0,0.03);
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  .envelope:hover { transform: scale(1.02) translateY(-4px); }

  .env-body { position: absolute; inset: 0; overflow: hidden; border-radius: 4px; z-index: 2; }
  .env-flap {
    position: absolute; top: 0; left: 0;
    width: 0; height: 0;
    border-style: solid;
    border-color: #fdfbf7 transparent transparent transparent;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.08));
    z-index: 3;
    transform-origin: top;
    transition: transform 0.6s ease;
  }
  .envelope:hover .env-flap { transform: rotateX(15deg); }

  .env-v-left {
    position: absolute; top: 0; left: 0;
    width: 0; height: 0;
    border-style: solid;
    border-color: transparent transparent #f9f5ed #f9f5ed;
  }
  .env-v-right {
    position: absolute; top: 0; right: 0;
    width: 0; height: 0;
    border-style: solid;
    border-color: transparent #f9f5ed #f9f5ed transparent;
  }

  .env-seal {
    position: absolute; left: 50%; top: 52%;
    transform: translate(-50%, -50%);
    width: 48px; height: 48px;
    background: linear-gradient(135deg, #be185d, #9d174d);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(157,23,77,0.4), inset 0 2px 4px rgba(255,255,255,0.3);
    z-index: 4;
    animation: pulseHeart 2s infinite ease-in-out;
  }
  @keyframes pulseHeart {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.08); }
  }

  .env-label {
    position: absolute; bottom: 15px; width: 100%; text-align: center;
    font-family: 'Great Vibes', cursive;
    font-size: 1.4rem; color: #831843; opacity: 0.85; z-index: 4;
  }

  .tap-hint {
    margin-top: 1.5rem;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-style: italic; color: #831843;
    animation: float 3s ease-in-out infinite;
  }

  /* ── OPEN CARD ── */
  .card-scene {
    position: absolute; z-index: 20;
    display: flex; flex-direction: column; align-items: center;
    opacity: 0; pointer-events: none;
    transform: scale(0.8) translateY(20px);
    transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s;
  }
  .card-scene.is-visible {
    opacity: 1; pointer-events: auto;
    transform: scale(1) translateY(0);
  }

  .card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(150, 40, 70, 0.25), inset 0 0 0 1px rgba(0,0,0,0.03);
    text-align: center;
    position: relative;
    display: flex; flex-direction: column; align-items: center;
    overflow: hidden;
  }
  .card-inner-border {
    position: absolute; inset: 10px;
    border-radius: 8px;
    pointer-events: none;
  }

  /* Decor elements */
  .card-corner {
    position: absolute; font-size: 1.2rem; color: #d4af37; opacity: 0.6; font-family: serif; pointer-events: none;
  }
  .card-corner.tl { top: 12px; left: 12px; }
  .card-corner.tr { top: 12px; right: 12px; transform: scaleX(-1); }
  .card-corner.bl { bottom: 12px; left: 12px; transform: scaleY(-1); }
  .card-corner.br { bottom: 12px; right: 12px; transform: scale(-1, -1); }

  .card-sticker {
    position: absolute; pointer-events: none; opacity: 0.8; z-index: 2;
  }

  /* Typography */
  .card-to {
    font-family: 'Great Vibes', cursive; color: #be185d;
    margin: 0; line-height: 1.2;
  }
  .card-flower { line-height: 1; display: block; }
  .card-title {
    font-family: 'Playfair Display', serif; font-weight: 700; color: #9d174d;
    line-height: 1.1; margin: 0; white-space: pre-line;
  }
  .card-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, #d4af37, transparent);
    opacity: 0.6;
  }
  .card-msg {
    font-family: 'Playfair Display', serif; font-style: italic; color: #831843;
    line-height: 1.6; margin: 0; white-space: pre-wrap;
  }
  .card-heart { display: block; animation: beat 2s infinite; }
  .card-from {
    font-family: 'Great Vibes', cursive; color: #be185d; margin: 0;
  }

  @keyframes beat {
    0%, 100% { transform: scale(1); }
    10%, 30% { transform: scale(1.15); }
    20% { transform: scale(1); }
  }

  /* ── ACTIONS ── */
  .md-actions {
    margin-top: 2rem; display: flex; flex-direction: column; gap: 0.8rem;
    opacity: 0; transform: translateY(10px); transition: all 0.6s ease;
  }
  .md-actions.visible { opacity: 1; transform: translateY(0); }
  
  .md-btn {
    padding: 0.85rem 1.8rem; border-radius: 999px; border: none;
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.9rem;
    cursor: pointer; box-shadow: 0 6px 16px rgba(190,50,90,0.2); transition: all 0.2s;
  }
  .md-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(190,50,90,0.3); }
  
  .md-btn-share { background: linear-gradient(135deg, #be185d, #ec4899); color: #fff; }
  .md-btn-create { background: #fff; color: #be185d; border: 1.5px solid #f9a8d4; }
  .md-btn-reset {
    background: transparent; box-shadow: none; color: #831843;
    font-size: 0.8rem; padding: 0.5rem; border: 1px solid rgba(131,24,67,0.2);
  }
  .md-btn-reset:hover { background: rgba(255,255,255,0.4); box-shadow: none; transform: none; }

  /* ── PARTICLES ── */
  .md-petal {
    position: fixed; pointer-events: none; z-index: 2; opacity: 0.7;
    animation: fall var(--dur) linear var(--delay) infinite;
  }
  @keyframes fall {
    0%   { transform: translate(0, -50px) rotate(0deg) scale(var(--s)); opacity: 0; }
    10%  { opacity: 0.8; }
    90%  { opacity: 0.8; }
    100% { transform: translate(var(--drift), 105vh) rotate(var(--rot)) scale(var(--s)); opacity: 0; }
  }

  .burst-particle { position: fixed; pointer-events: none; z-index: 50; opacity: 0; }
  .burst-particle.go { animation: burstOut var(--dur, 2.5s) ease-out var(--delay, 0s) forwards; }
  @keyframes burstOut {
    0%   { opacity: 0; transform: translate(0, 0) scale(0.3) rotate(0deg); }
    12%  { opacity: 1; transform: translate(var(--dx, 0), var(--dy, -20px)) scale(1.1) rotate(calc(var(--rot, 0) * 1deg)); }
    100% { opacity: 0; transform: translate(calc(var(--dx, 0) * 3.5), calc(var(--dy, -20px) * 5)) scale(0.2) rotate(calc(var(--rot, 0) * 5deg)); }
  }

  .sparkle {
    position: fixed; pointer-events: none; z-index: 49;
    width: 6px; height: 6px; background: #fbbf24; border-radius: 50%; opacity: 0;
    box-shadow: 0 0 10px 4px rgba(251,191,36,0.45);
  }
  .sparkle.go { animation: sparkleAnim var(--dur, 1.6s) ease-out var(--delay, 0s) forwards; }
  @keyframes sparkleAnim {
    0%   { opacity: 0; transform: scale(0); }
    18%  { opacity: 1; transform: scale(1.8); }
    100% { opacity: 0; transform: translate(var(--dx, 0), var(--dy, -30px)) scale(0); }
  }

  .md-lang { position: fixed; top: 1rem; right: 1rem; z-index: 100; }

  /* ── RESPONSIVE BUMP (Bigger sizes) ── */
  @media (max-width: 380px) {
    .envelope { width: min(280px, 85vw); height: 195px; }
    .env-flap { border-left-width: min(140px, 42.5vw); border-right-width: min(140px, 42.5vw); border-top-width: 105px; }
    .env-v-left { border-left-width: min(140px, 42.5vw); border-top-width: 195px; }
    .env-v-right { border-right-width: min(140px, 42.5vw); border-top-width: 195px; }
    .card { width: min(320px, 92vw); padding: 2rem 1.2rem; }
    .card-to { font-size: 1.1rem; margin-bottom: 0.3rem; }
    .card-flower { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .card-title { font-size: 1.6rem; margin-bottom: 0.8rem; }
    .card-line { width: 60px; margin: 0 auto 0.8rem; }
    .card-msg { font-size: 0.95rem; max-width: 100%; }
    .card-heart { font-size: 1.2rem; margin: 1rem 0 0.5rem; }
    .card-from { font-size: 1.2rem; }
    .card-sticker { font-size: 1.4rem; }
  }

  @media (min-width: 381px) {
    .envelope { width: min(340px, 90vw); height: 230px; }
    .env-flap { border-left-width: min(170px, 45vw); border-right-width: min(170px, 45vw); border-top-width: 125px; }
    .env-v-left { border-left-width: min(170px, 45vw); border-top-width: 230px; }
    .env-v-right { border-right-width: min(170px, 45vw); border-top-width: 230px; }
    .card { width: min(400px, 94vw); padding: 3rem 2rem 2.5rem; }
    .card-to { font-size: 1.3rem; margin-bottom: 0.5rem; }
    .card-flower { font-size: 1.8rem; margin-bottom: 0.8rem; }
    .card-title { font-size: 2.2rem; margin-bottom: 1rem; }
    .card-line { width: 80px; margin: 0 auto 1rem; }
    .card-msg { font-size: 1.05rem; max-width: 300px; }
    .card-heart { font-size: 1.4rem; margin: 1.5rem 0 0.8rem; }
    .card-from { font-size: 1.4rem; }
    .card-sticker { font-size: 1.8rem; }
  }
`;

const PETAL_EMOJIS = ["🌸", "🌷", "💮", "✿", "🩷", "❀"];
function generatePetals(count = 14) {
  return Array.from({ length: count }, (_, i) => ({
    id: i, emoji: PETAL_EMOJIS[i % PETAL_EMOJIS.length],
    left: Math.random() * 100, dur: 8 + Math.random() * 10,
    delay: Math.random() * 12, drift: (Math.random() - 0.5) * 100,
    rot: 180 + Math.random() * 360, scale: 0.5 + Math.random() * 0.6,
  }));
}

export default function MothersDayCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Decode custom card data if present
  const cardData = useMemo(() => {
    const p = searchParams.get("card");
    if (!p) return null;
    try { return JSON.parse(decodeURIComponent(escape(atob(p)))); } catch { return null; }
  }, [searchParams]);

  const [isOpen, setIsOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const petals = useRef(generatePetals());
  const hasOpened = useRef(false);

  // Content fallbacks
  const cTo = cardData?.to || t("md.letterTo", "To the most wonderful Mom");
  const cMsg = cardData?.msg || t("md.letterMessage", "Thank you for your endless love, your warm hugs, and for always believing in me.\nYou are my sunshine. ☀️");
  const cFrom = cardData?.from || t("md.letterFrom", "With all my love");
  const cPaper = PAPERS[cardData?.paper] || PAPERS.blush;
  const cDecos = cardData?.decos || [];

  useEffect(() => {
    applySeo({
      title: "Happy Mother's Day Card | Create & Send a Digital Card Free",
      description: "Open a beautiful interactive Mother's Day card. Tap the envelope to reveal a heartfelt message. Create your own personalized digital card for mom free.",
      keywords: seoKeywords.mothersDay,
      path: "/mothers-day",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Mother's Day Digital Card Maker",
        "url": window.location.href,
        "description": "Create and send personalized, interactive digital Mother's Day cards for free.",
        "applicationCategory": "LifestyleApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    });
  }, []);

  const burstParticles = useCallback(() => {
    const emojis = ["🌸", "💗", "🌷", "💖", "✨", "🩷", "🌺", "💕", "🏵️", "🌹"];
    setParticles(Array.from({ length: 25 }, (_, i) => ({
      id: Date.now() + i, emoji: emojis[i % emojis.length],
      left: 30 + Math.random() * 40, top: 30 + Math.random() * 30,
      dx: (Math.random() - 0.5) * 260, dy: -(50 + Math.random() * 120),
      rot: (Math.random() - 0.5) * 120, delay: Math.random() * 0.5,
      dur: 2.2 + Math.random() * 1.5, size: 1 + Math.random() * 0.8,
    })));
    setSparkles(Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + 200 + i, left: 25 + Math.random() * 50, top: 25 + Math.random() * 35,
      dx: (Math.random() - 0.5) * 150, dy: -(30 + Math.random() * 90),
      delay: 0.1 + Math.random() * 0.7, dur: 1.2 + Math.random() * 1.2,
    })));
  }, []);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    if (!hasOpened.current) {
      hasOpened.current = true;
      setTimeout(() => burstParticles(), 200);
      setTimeout(() => setShowActions(true), 1800);
    }
  };

  const handleReset = () => {
    setIsOpen(false);
    setShowActions(false);
    setParticles([]);
    setSparkles([]);
    hasOpened.current = false;
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = "Happy Mother's Day! 💐 Open this card for a surprise ✨";
    if (navigator.share) {
      navigator.share({ title: "Mother's Day Card", text, url }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    }
  };

  return (
    <div className="md-page">
      <style>{CSS}</style>

      <div className="md-lang">
        <LanguageSwitcher />
      </div>

      {petals.current.map((p) => (
        <span key={p.id} className="md-petal" style={{ left: `${p.left}%`, top: "-30px", fontSize: `${p.scale * 1.3}rem`, "--dur": `${p.dur}s`, "--delay": `${p.delay}s`, "--drift": `${p.drift}px`, "--rot": `${p.rot}deg`, "--s": p.scale }}>{p.emoji}</span>
      ))}

      {particles.map((p) => (
        <span key={p.id} className="burst-particle go" style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: `${p.size}rem`, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": p.rot, "--delay": `${p.delay}s`, "--dur": `${p.dur}s` }}>{p.emoji}</span>
      ))}

      {sparkles.map((s) => (
        <span key={s.id} className="sparkle go" style={{ left: `${s.left}%`, top: `${s.top}%`, "--dx": `${s.dx}px`, "--dy": `${s.dy}px`, "--delay": `${s.delay}s`, "--dur": `${s.dur}s` }} />
      ))}

      {/* ═══ ENVELOPE ═══ */}
      <div className={`envelope-scene ${isOpen ? "is-hidden" : ""}`}>
        <div className="envelope" onClick={handleOpen}>
          <div className="env-flap" />
          <div className="env-body">
            <div className="env-v-left" />
            <div className="env-v-right" />
            <div className="env-seal">💌</div>
            <span className="env-label">{cardData ? `for ${cardData.to || "Mom"}` : t("md.forYou", "for you, Mom")}</span>
          </div>
        </div>
        <div className="tap-hint"><span>💝</span> {t("md.tapToOpen", "Tap to open")}</div>
      </div>

      {/* ═══ OPEN CARD ═══ */}
      <div className={`card-scene ${isOpen ? "is-visible" : ""}`}>
        <div className="card" style={{ background: cPaper.bg }}>
          <div className="card-inner-border" style={{ border: `1.5px solid ${cPaper.border}` }} />
          <span className="card-corner tl">❧</span>
          <span className="card-corner tr">❧</span>
          <span className="card-corner bl">❧</span>
          <span className="card-corner br">❧</span>

          {cDecos.map((d, i) => DECOS_MAP[d] && (
            <span key={d} className="card-sticker" style={{ ...DECO_POSITIONS[i % DECO_POSITIONS.length], transform: `rotate(${DECO_POSITIONS[i % DECO_POSITIONS.length].rot}deg)` }}>{DECOS_MAP[d]}</span>
          ))}

          <p className="card-to">{cTo}</p>
          <span className="card-flower">🌷</span>
          <h1 className="card-title">{t("md.happyMothersDay", "Happy\nMother's Day")}</h1>
          <div className="card-line" />
          <p className="card-msg">{cMsg}</p>
          <span className="card-heart">❤️</span>
          {cFrom && <p className="card-from">{cFrom}</p>}
        </div>

        <div className={`md-actions ${showActions ? "visible" : ""}`}>
          {cardData ? (
            <>
              <button className="md-btn md-btn-share" onClick={() => navigate("/create-mothers-day-card")}>
                Create your own card ✨
              </button>
              <button className="md-btn md-btn-create" onClick={() => navigate("/create")}>
                Build a bouquet 💐
              </button>
            </>
          ) : (
            <>
              <button className="md-btn md-btn-share" onClick={handleShare}>
                {t("md.shareCard", "Share this card 💌")}
              </button>
              <button className="md-btn md-btn-create" onClick={() => navigate("/create-mothers-day-card")}>
                Personalize it ✨
              </button>
            </>
          )}
          <button className="md-btn md-btn-reset" onClick={handleReset}>
            {t("md.replay", "↻ Open again")}
          </button>
        </div>
      </div>
    </div>
  );
}
