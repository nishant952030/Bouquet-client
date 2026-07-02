'use client';

import { useEffect, useRef, useState } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

/**
 * LottiePet — animated Lottie pet character using the user-provided .lottie file.
 *
 * Props:
 *  petType  'puppy' | 'kitten' | 'panda' | 'bunny'
 *  hunger   0-100
 *  attention 0-100
 *  status   'active' | 'sick' | 'runaway'
 *  mousePos {x, y}  (-1..1 offset from card center)
 *  size     canvas size in px (default 280)
 */
export default function LottiePet({
  petType = 'puppy',
  hunger = 100,
  attention = 100,
  status = 'active',
  mousePos = { x: 0, y: 0 },
  size = 280,
}) {
  const containerRef = useRef(null);

  // ── resolve emotional state ──────────────────────────────────────────────
  function resolveState() {
    if (status === 'sick' || status === 'runaway') return 'sick';
    const minStat = Math.min(hunger, attention);
    if (minStat > 60) return 'happy';
    if (minStat > 30) return 'idle';
    return 'hungry';
  }

  const currentState = resolveState();

  // ── mouse parallax (head tilt via CSS transform on the canvas) ───────────
  const mx = mousePos.x * 12;   // max ±12px horizontal
  const my = mousePos.y * 8;    // max ±8px vertical

  // Speed multipliers per state
  const speedMap = { idle: 1, happy: 1.4, hungry: 0.7, sick: 0.5 };
  const speed = speedMap[currentState] ?? 1;

  // The premium .lottie animation URL provided by the user
  const dotLottieUrl = "https://lottie.host/53ac1168-9221-432b-a027-0aa8790d5c56/8kmCVF2KWW.lottie";

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: currentState === 'sick' ? 'saturate(0.4) brightness(0.85)' : 'none',
        transition: 'filter 0.6s ease',
      }}
    >
      {/* Subtle shadow blob under the pet */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.6,
          height: 14,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.15)',
          filter: 'blur(5px)',
          transition: 'transform 0.15s ease-out',
          transform: `translateX(-50%) scaleX(${
            currentState === 'happy' ? 0.85 : 1
          })`,
        }}
      />

      {/* Lottie canvas with head-parallax transform */}
      <div
        style={{
          transform: `translate(${mx}px, ${my}px)`,
          transition: 'transform 0.15s ease-out',
          width: '100%',
          height: '100%',
        }}
      >
        <DotLottiePlayer
          src={dotLottieUrl}
          autoplay
          loop
          speed={speed}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* State badge */}
      <StateBadge state={currentState} />
    </div>
  );
}

function StateBadge({ state }) {
  const config = {
    happy:  { emoji: '✨', label: 'Happy',   color: '#10b981' },
    idle:   { emoji: '😊', label: 'Content', color: '#6366f1' },
    hungry: { emoji: '🍽️', label: 'Hungry',  color: '#f59e0b' },
    sick:   { emoji: '🤒', label: 'Sick',    color: '#ef4444' },
  }[state] ?? { emoji: '😊', label: 'Content', color: '#6366f1' };

  return (
    <div
      style={{
        position: 'absolute',
        top: 6,
        right: 6,
        background: config.color + '22',
        border: `1px solid ${config.color}55`,
        borderRadius: '999px',
        padding: '2px 8px',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: config.color,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        backdropFilter: 'blur(4px)',
      }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </div>
  );
}
