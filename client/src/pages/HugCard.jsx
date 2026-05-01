import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

/* ═══════════════════════════════════════════════════════════════════
   Pop-Up Hug Card — cross-shaped reveal
   Closed → normal rectangle
   Open → top slides up, arms pop out left/right forming a + shape
   ═══════════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&family=Manrope:wght@400;500;600;700&display=swap');

  .hug-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #fce4ec 0%, #f8bbd0 40%, #f48fb1 100%);
    padding: 2rem 1rem;
    overflow: hidden;
    position: relative;
    font-family: 'Manrope', sans-serif;
    user-select: none;
    -webkit-user-select: none;
    cursor: default;
  }

  /* Scattered decorations on background */
  .bg-deco {
    position: absolute;
    pointer-events: none;
    opacity: 0.25;
    font-size: 1.5rem;
  }

  /* ═══ CARD ASSEMBLY ═══
     The card is a stack of layers:
     - Bottom half (stays fixed)
     - Inner cross piece (arms + body) — revealed as top slides
     - Top half (slides upward on open)
  */
  .card-scene {
    position: relative;
    width: 280px;
    /* total closed height = top + bottom */
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }

  /* ─── BOTTOM HALF of the outer card ─── */
  .card-bottom {
    position: relative;
    width: 100%;
    height: 200px;
    background: #fff;
    border-radius: 0 0 14px 14px;
    z-index: 2;
    box-shadow:
      0 6px 24px rgba(0,0,0,0.10),
      0 2px 6px rgba(0,0,0,0.06);
    overflow: hidden;
  }

  /* Paper texture */
  .card-bottom::before, .card-top::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
  }

  .card-bottom-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 1rem 1.5rem;
    text-align: center;
  }

  .card-bottom-content .msg-love {
    font-family: 'Caveat', cursive;
    font-size: 1.9rem;
    font-weight: 700;
    color: #d81b60;
    line-height: 1.2;
    margin-bottom: 0.25rem;
  }

  .card-bottom-content .msg-thiiis {
    font-family: 'Patrick Hand', cursive;
    font-size: 1.35rem;
    color: #333;
    letter-spacing: 0.5px;
  }

  .card-bottom-content .msg-thiiis em {
    font-style: normal;
    font-size: 1.5rem;
    letter-spacing: 2px;
    color: #e91e63;
  }

  .card-bottom-content .msg-much {
    font-family: 'Patrick Hand', cursive;
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
  }

  .card-bottom-content .heart-big {
    font-size: 2rem;
    margin-top: 0.15rem;
    animation: heartPump 1.3s ease-in-out infinite;
  }

  @keyframes heartPump {
    0%,100% { transform: scale(1); }
    15% { transform: scale(1.2); }
    30% { transform: scale(1); }
    45% { transform: scale(1.15); }
    60% { transform: scale(1); }
  }

  /* ─── TOP HALF of the outer card (slides up) ─── */
  .card-top {
    position: relative;
    width: 100%;
    height: 200px;
    background: #fff;
    border-radius: 14px 14px 0 0;
    z-index: 5;
    box-shadow:
      0 -2px 12px rgba(0,0,0,0.06),
      0 4px 20px rgba(0,0,0,0.10);
    cursor: pointer;
    overflow: hidden;
  }

  .card-top-inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 1.5rem;
    text-align: center;
  }

  .card-top-inner .front-title {
    font-family: 'Caveat', cursive;
    font-size: 2.8rem;
    font-weight: 700;
    color: #d81b60;
    line-height: 1.05;
    margin-bottom: 0.4rem;
    text-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }

  .card-top-inner .front-hearts {
    font-size: 1.1rem;
    letter-spacing: 6px;
    margin-bottom: 0.75rem;
  }

  .card-top-inner .front-open {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: #fce4ec;
    border: 1.5px dashed #f48fb1;
    border-radius: 10px;
    padding: 0.4rem 1.4rem;
    font-family: 'Patrick Hand', cursive;
    font-size: 1rem;
    color: #c2185b;
    letter-spacing: 0.5px;
  }

  .front-open .arrow {
    font-size: 1.2rem;
    animation: pullBounce 1s ease-in-out infinite;
  }

  @keyframes pullBounce {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }

  /* Cut line between top and bottom when slightly open */
  .card-cut-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: repeating-linear-gradient(
      90deg, #e0e0e0 0, #e0e0e0 6px, transparent 6px, transparent 12px
    );
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
  }

  /* ─── CROSS-PIECE: the arms + character body ─── */
  .cross-piece {
    position: absolute;
    z-index: 3;
    /* The cross-piece sits between top and bottom card halves */
    pointer-events: none;
  }

  /* The horizontal bar (arms) */
  .cross-arms {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 110px;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Individual arm */
  .arm {
    height: 100%;
    background: #fff;
    position: relative;
    box-shadow: 0 3px 12px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .arm::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .arm-left {
    border-radius: 12px 0 0 12px;
  }
  .arm-right {
    border-radius: 0 12px 12px 0;
  }

  /* Hand circles at arm tips */
  .hand {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #fff;
    border: 2.5px solid #333;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .hand-left { left: -8px; }
  .hand-right { right: -8px; }

  /* Fingers on hands */
  .fingers {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .fingers-left {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
  }
  .fingers-right {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
  }
  .finger {
    width: 8px;
    height: 5px;
    background: #fff;
    border: 1.5px solid #333;
    border-radius: 3px;
  }

  /* ─── Character body (center of cross) ─── */
  .char-body {
    position: relative;
    width: 120px;
    height: 110px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 2;
  }

  /* The stick figure character drawn with CSS */
  .stick-figure {
    position: relative;
    width: 80px;
    height: 95px;
  }

  /* Head */
  .sf-head {
    width: 42px;
    height: 42px;
    border: 2.5px solid #333;
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
  }

  /* Eyes */
  .sf-eye {
    width: 5px;
    height: 6px;
    background: #333;
    border-radius: 50%;
    position: absolute;
    top: 15px;
  }
  .sf-eye-left { left: 11px; }
  .sf-eye-right { right: 11px; }

  /* Smile */
  .sf-smile {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 7px;
    border: 2px solid #333;
    border-top: none;
    border-radius: 0 0 50% 50%;
  }

  /* Body line */
  .sf-body-line {
    position: absolute;
    top: 42px;
    left: 50%;
    width: 2.5px;
    height: 30px;
    background: #333;
    transform: translateX(-50%);
  }

  /* Legs */
  .sf-leg {
    position: absolute;
    bottom: 0;
    width: 2.5px;
    height: 24px;
    background: #333;
  }
  .sf-leg-left {
    left: 18px;
    transform: rotate(12deg);
    transform-origin: top center;
  }
  .sf-leg-right {
    right: 18px;
    transform: rotate(-12deg);
    transform-origin: top center;
  }

  /* Arm stubs (lines going to the sides) */
  .sf-arm-stub {
    position: absolute;
    top: 50px;
    width: 22px;
    height: 2.5px;
    background: #333;
  }
  .sf-arm-stub-left {
    right: 50%;
    margin-right: 1px;
  }
  .sf-arm-stub-right {
    left: 50%;
    margin-left: 1px;
  }

  /* ─── Hint text ─── */
  .hug-hint {
    margin-top: 1.5rem;
    font-family: 'Patrick Hand', cursive;
    font-size: 1rem;
    color: rgba(255,255,255,0.8);
    text-align: center;
    letter-spacing: 0.5px;
  }

  /* Reset button */
  .hug-reset {
    margin-top: 1rem;
    padding: 0.5rem 1.6rem;
    background: rgba(255,255,255,0.25);
    backdrop-filter: blur(8px);
    border: 1.5px solid rgba(255,255,255,0.5);
    border-radius: 999px;
    color: #fff;
    font-family: 'Patrick Hand', cursive;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }
  .hug-reset:hover {
    background: rgba(255,255,255,0.4);
    transform: translateY(-1px);
  }

  /* Floating hearts burst */
  .burst-heart {
    position: absolute;
    pointer-events: none;
    z-index: 20;
    opacity: 0;
  }
  .burst-heart.go {
    animation: burstUp var(--dur, 2s) ease-out var(--delay, 0s) forwards;
  }
  @keyframes burstUp {
    0%   { opacity: 0; transform: translate(0, 0) scale(0.3) rotate(0deg); }
    15%  { opacity: 1; transform: translate(var(--dx, 0px), -15px) scale(1) rotate(calc(var(--rot, 0) * 1deg)); }
    100% { opacity: 0; transform: translate(calc(var(--dx, 0px) * 2.5), -140px) scale(0.5) rotate(calc(var(--rot, 0) * 3deg)); }
  }

  /* Dashed fold line on arms */
  .fold-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    border-left: 1.5px dashed rgba(0,0,0,0.1);
  }
`;

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export default function HugCard() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0); // 0=closed, 1=open
  const [isOpen, setIsOpen] = useState(false);
  const [hearts, setHearts] = useState([]);
  const animRef = useRef(null);
  const dragging = useRef(false);
  const dragStartY = useRef(0);
  const progAtDragStart = useRef(0);

  const CARD_W = 280;
  const HALF_H = 200;
  const ARM_W_MAX = 130; // max width each arm extends
  const ARM_H = 110;
  const GAP_MAX = 120; // max vertical gap between top and bottom halves

  /* ── derived values ── */
  const gap = lerp(0, GAP_MAX, progress);
  const armWidth = lerp(0, ARM_W_MAX, Math.min(progress / 0.6, 1));
  const armOpacity = lerp(0, 1, Math.min(progress / 0.35, 1));
  const crossTop = HALF_H; // cross piece sits at the split between halves

  // When fully open, arms do a slight "hug" wiggle
  const hugRotate = isOpen
    ? 0
    : 0;

  /* ── open animation ── */
  const animateTo = useCallback((target) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = progress;
    const startTime = performance.now();
    const duration = Math.abs(target - start) * 900 + 200;

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = target > start
        ? 1 - Math.pow(1 - t, 3)  // ease-out
        : t * t;                   // ease-in
      const val = lerp(start, target, eased);
      setProgress(val);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        if (target === 1) {
          setIsOpen(true);
          burstHearts();
        } else {
          setIsOpen(false);
          setHearts([]);
        }
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [progress]);

  /* ── heart burst ── */
  const burstHearts = () => {
    const emojis = ["❤️", "💕", "💗", "💖", "🩷", "🧡"];
    setHearts(
      Array.from({ length: 14 }, (_, i) => ({
        id: Date.now() + i,
        emoji: emojis[i % emojis.length],
        left: 30 + Math.random() * 40,
        bottom: 30 + Math.random() * 20,
        dx: (Math.random() - 0.5) * 120,
        rot: (Math.random() - 0.5) * 60,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1,
        size: 0.9 + Math.random() * 0.8,
      }))
    );
  };

  /* ── pointer handlers (on top half) ── */
  const onPointerDown = (e) => {
    if (isOpen) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    dragging.current = true;
    dragStartY.current = e.clientY;
    progAtDragStart.current = progress;
    e.target.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current || isOpen) return;
    const dy = dragStartY.current - e.clientY; // positive = dragged up
    if (dy > 0) {
      const newP = Math.min(progAtDragStart.current + dy / 200, 1);
      setProgress(newP);
    } else {
      const newP = Math.max(progAtDragStart.current + dy / 200, 0);
      setProgress(newP);
    }
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (progress > 0.4) {
      animateTo(1);
    } else if (progress > 0) {
      animateTo(0);
    }
  };

  const handleClick = () => {
    if (isOpen) return;
    if (progress < 0.1) animateTo(1);
  };

  const handleReset = () => {
    setIsOpen(false);
    setHearts([]);
    animateTo(0);
  };

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  /* total scene height adjusts as card opens */
  const sceneH = HALF_H * 2 + gap;

  return (
    <div className="hug-page">
      <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 100 }}>
        <LanguageSwitcher />
      </div>
      <style>{CSS}</style>

      {/* Background decorations */}
      {["❤️", "💕", "♥", "🩷", "💗", "❤️", "♥", "💕"].map((e, i) => (
        <span
          key={i}
          className="bg-deco"
          style={{
            left: `${8 + (i * 13) % 85}%`,
            top: `${5 + (i * 17 + 10) % 85}%`,
            transform: `rotate(${i * 37}deg)`,
            fontSize: `${1 + (i % 3) * 0.5}rem`,
          }}
        >
          {e}
        </span>
      ))}

      {/* Heart bursts */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="burst-heart go"
          style={{
            left: `${h.left}%`,
            bottom: `${h.bottom}%`,
            fontSize: `${h.size}rem`,
            "--dx": `${h.dx}px`,
            "--rot": h.rot,
            "--delay": `${h.delay}s`,
            "--dur": `${h.dur}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}

      <div className="card-scene" style={{ height: sceneH }}>

        {/* ═══ TOP HALF (slides upward) ═══ */}
        <div
          className="card-top"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CARD_W,
            transform: `translateY(${-gap / 2}px)`,
            transition: dragging.current ? "none" : "transform 0.15s ease",
            zIndex: 5,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={handleClick}
        >
          <div className="card-top-inner">
            <span className="front-hearts">❤️ ❤️ ❤️</span>
            <div className="front-title">
              {t("hugCard.frontTitleLine1", "Happy")}<br />{t("hugCard.frontTitleLine2", "Mother's")}<br />{t("hugCard.frontTitleLine3", "Day!")}
            </div>
            <div className="front-open" style={{ opacity: progress < 0.3 ? 1 : 0, transition: "opacity 0.3s" }}>
              <span>{t("hugCard.pullUpToOpen", "Pull up to open")}</span>
              <span className="arrow">↑</span>
            </div>
          </div>
        </div>

        {/* ═══ CROSS-PIECE (arms + character) ═══ */}
        <div
          className="cross-piece"
          style={{
            top: HALF_H - ARM_H / 2 + gap / 2,
            left: 0,
            width: CARD_W,
            height: ARM_H,
            transition: dragging.current ? "none" : "top 0.15s ease",
          }}
        >
          <div
            className="cross-arms"
            style={{
              width: CARD_W + armWidth * 2,
              top: 0,
              transition: dragging.current ? "none" : "width 0.2s ease",
            }}
          >
            {/* LEFT ARM */}
            <div
              className="arm arm-left"
              style={{
                width: armWidth,
                opacity: armOpacity,
                transition: dragging.current ? "none" : "width 0.2s ease, opacity 0.2s",
              }}
            >
              <div className="fold-line" style={{ right: 0 }} />
              {/* Hand */}
              <div className="hand hand-left">
                <div className="fingers fingers-left">
                  <div className="finger" />
                  <div className="finger" />
                  <div className="finger" />
                </div>
              </div>
              {/* Arm lines drawn */}
              <svg
                viewBox="0 0 100 80" width="100%" height="100%"
                style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
              >
                <line x1="90" y1="40" x2="25" y2="40" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* CENTER BODY */}
            <div className="char-body">
              <div className="stick-figure">
                {/* Head */}
                <div className="sf-head">
                  <div className="sf-eye sf-eye-left" />
                  <div className="sf-eye sf-eye-right" />
                  <div className="sf-smile" />
                </div>
                {/* Body */}
                <div className="sf-body-line" />
                {/* Arm stubs connecting to extended arms */}
                <div className="sf-arm-stub sf-arm-stub-left" />
                <div className="sf-arm-stub sf-arm-stub-right" />
                {/* Legs */}
                <div className="sf-leg sf-leg-left" />
                <div className="sf-leg sf-leg-right" />
              </div>
            </div>

            {/* RIGHT ARM */}
            <div
              className="arm arm-right"
              style={{
                width: armWidth,
                opacity: armOpacity,
                transition: dragging.current ? "none" : "width 0.2s ease, opacity 0.2s",
              }}
            >
              <div className="fold-line" style={{ left: 0 }} />
              {/* Hand */}
              <div className="hand hand-right">
                <div className="fingers fingers-right">
                  <div className="finger" />
                  <div className="finger" />
                  <div className="finger" />
                </div>
              </div>
              {/* Arm line */}
              <svg
                viewBox="0 0 100 80" width="100%" height="100%"
                style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
              >
                <line x1="10" y1="40" x2="75" y2="40" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM HALF (stays, or slides down slightly) ═══ */}
        <div
          className="card-bottom"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: CARD_W,
            transform: `translateY(${gap / 2}px)`,
            transition: dragging.current ? "none" : "transform 0.15s ease",
            zIndex: 2,
          }}
        >
          <div className="card-bottom-content">
            <p className="msg-love" style={{
              opacity: lerp(0, 1, Math.max((progress - 0.3) / 0.4, 0)),
              transform: `translateY(${lerp(15, 0, Math.max((progress - 0.3) / 0.4, 0))}px)`,
              transition: dragging.current ? "none" : "all 0.3s ease",
            }}>
              {t("hugCard.iLoveYou", "I love you")}
            </p>
            <p className="msg-thiiis" style={{
              opacity: lerp(0, 1, Math.max((progress - 0.45) / 0.35, 0)),
              transform: `translateY(${lerp(12, 0, Math.max((progress - 0.45) / 0.35, 0))}px)`,
              transition: dragging.current ? "none" : "all 0.3s ease 0.05s",
            }}>
              <em>{t("hugCard.thiiis", "thiiiiiiis")}</em> {t("hugCard.much", "much")}
            </p>
            <span className="heart-big" style={{
              display: "inline-block",
              opacity: lerp(0, 1, Math.max((progress - 0.6) / 0.3, 0)),
              transform: `scale(${lerp(0.3, 1, Math.max((progress - 0.6) / 0.3, 0))})`,
              transition: dragging.current ? "none" : "all 0.3s ease 0.1s",
            }}>
              ❤️
            </span>
          </div>
        </div>

      </div>

      {/* Hint or reset */}
      {!isOpen && progress < 0.05 && (
        <p className="hug-hint">{t("hugCard.hint", "Tap the card or drag upward to open 💌")}</p>
      )}
      {isOpen && (
        <button className="hug-reset" onClick={handleReset}>
          {t("hugCard.closeAndReplay", "↻ Close & replay")}
        </button>
      )}
    </div>
  );
}
