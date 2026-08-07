'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * PuppyVisual — an ultra-premium, interactive SVG puppy character.
 * Reacts dynamically to mouse coordinates, hunger, attention, status, and clicks.
 *
 * Props:
 *  hunger      0-100 (drives begging mouth, low energy breathing)
 *  attention   0-100 (drives eye expressions, ear droop, sadness tears)
 *  status      'active' | 'sick' | 'runaway' (drives sick eyes, shiver)
 *  mousePos    {x, y} (-1..1 relative coordinates)
 *  size        pixel size (default 260)
 */
export default function PuppyVisual({
  hunger = 100,
  attention = 100,
  status = 'active',
  mousePos = { x: 0, y: 0 },
  size = 260,
}) {
  const [isPatting, setIsPatting] = useState(false);
  const [isSleepy, setIsSleepy] = useState(false);
  const [extraHearts, setExtraHearts] = useState([]);
  const [tears, setTears] = useState([]);
  const [zzzs, setZzzs] = useState([]);
  const lastMoveTimeRef = useRef(Date.now());
  const requestRef = useRef(null);

  // Track cursor idle time for "Sleepy" state
  useEffect(() => {
    lastMoveTimeRef.current = Date.now();
    setIsSleepy(false);

    const interval = setInterval(() => {
      const idleTime = Date.now() - lastMoveTimeRef.current;
      if (idleTime > 12000 && hunger > 15 && attention > 15 && status === 'active') {
        setIsSleepy(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mousePos, hunger, attention, status]);

  // Keep updating idle timer when stats change
  useEffect(() => {
    lastMoveTimeRef.current = Date.now();
    setIsSleepy(false);
  }, [hunger, attention, status]);

  // Handle particle animations (Tears & Zzzs)
  useEffect(() => {
    let frameId;
    const updateParticles = () => {
      // 1. Update tears
      setTears((prevTears) =>
        prevTears
          .map((t) => ({ ...t, y: t.y + 2, opacity: t.opacity - 0.02 }))
          .filter((t) => t.opacity > 0)
      );

      // 2. Update Zzzs
      setZzzs((prevZzzs) =>
        prevZzzs
          .map((z) => ({
            ...z,
            y: z.y - 1.2,
            x: z.x + Math.sin(z.y / 10) * 0.8,
            opacity: z.opacity - 0.015,
          }))
          .filter((z) => z.opacity > 0)
      );

      // 3. Update hearts
      setExtraHearts((prev) =>
        prev
          .map((h) => ({ ...h, y: h.y - 2, opacity: h.opacity - 0.02 }))
          .filter((h) => h.opacity > 0)
      );

      frameId = requestAnimationFrame(updateParticles);
    };

    frameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Spawn tears if extremely sad/lonely
  useEffect(() => {
    if (attention <= 30 && status === 'active' && !isSleepy) {
      const interval = setInterval(() => {
        // Spawn one tear from left or right eye
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const startX = side === 'left' ? 78 : 122;
        const startY = 82;
        setTears((prev) => [
          ...prev,
          { id: Math.random(), x: startX, y: startY, opacity: 1 },
        ]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [attention, status, isSleepy]);

  // Spawn Zzzs when sleepy
  useEffect(() => {
    if (isSleepy) {
      const interval = setInterval(() => {
        setZzzs((prev) => [
          ...prev,
          {
            id: Math.random(),
            x: 120 + Math.random() * 20,
            y: 70,
            scale: 0.8 + Math.random() * 0.5,
            opacity: 1,
          },
        ]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isSleepy]);

  // Web Audio Synth for patting feedback
  const playPatChime = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  // Pat Handler (Clicking on puppy)
  const handlePat = () => {
    if (status === 'runaway') return;
    setIsPatting(true);
    playPatChime();

    // Spawn 3 hearts
    const newHearts = Array.from({ length: 3 }).map((_, i) => ({
      id: Math.random() + i,
      x: 70 + Math.random() * 60,
      y: 60,
      scale: 0.8 + Math.random() * 0.6,
      opacity: 1,
    }));
    setExtraHearts((prev) => [...prev, ...newHearts]);

    setTimeout(() => {
      setIsPatting(false);
    }, 900);
  };

  // ─── Resolve puppy expressions ──────────────────────────────────────────────
  const isSick = status === 'sick' || status === 'runaway';
  const isHungry = hunger <= 40;
  const isLonely = attention <= 40;
  const isEcstatic = hunger >= 75 && attention >= 75 && !isSleepy && !isSick;

  // Head shiver for sick/cold state
  let shiverClass = '';
  if (isSick) {
    shiverClass = 'animate-pulse';
  }

  // Tail wagging speed
  let tailSpeed = '1.8s';
  if (isEcstatic) tailSpeed = '0.35s';
  else if (isPatting) tailSpeed = '0.5s';
  else if (isLonely || isSick) tailSpeed = '3s';

  // Breathing speed & scale
  let breatheSpeed = '3.5s';
  let breatheMaxY = 1.05;
  if (isEcstatic) {
    breatheSpeed = '1.2s';
    breatheMaxY = 1.08;
  } else if (isHungry || isLonely) {
    breatheSpeed = '2.2s';
    breatheMaxY = 1.03;
  } else if (isSick) {
    breatheSpeed = '1.5s';
    breatheMaxY = 1.015;
  }

  // Ear position / rotation
  let earAngleLeft = -15;
  let earAngleRight = 15;
  if (isSick || isLonely) {
    earAngleLeft = 8;
    earAngleRight = -8;
  } else if (isEcstatic || isPatting) {
    earAngleLeft = -28;
    earAngleRight = 28;
  }

  // ─── Pupil Parallax calculation (Pupils follow cursor directly) ───────────
  // Center coordinates of Left Eye: (80, 80), Right Eye: (120, 80)
  const computePupilOffset = (eyeCenterX, eyeCenterY) => {
    if (isSleepy || isPatting || isSick) return { x: 0, y: 0 };
    // mousePos ranges from -1 to 1
    const maxOffset = 5.5; // max pupil movement radius
    const dx = mousePos.x * maxOffset;
    const dy = mousePos.y * maxOffset;
    return { x: dx, y: dy };
  };

  const pupilL = computePupilOffset(80, 80);
  const pupilR = computePupilOffset(120, 80);

  // ─── Rendering Eyes ─────────────────────────────────────────────────────────
  let leftEye, rightEye;
  if (isSleepy) {
    // Closed curved sleeping eyes (^-^)
    leftEye = <path d="M 72 82 Q 80 75 88 82" fill="none" stroke="#2c1e18" strokeWidth="4.5" strokeLinecap="round" />;
    rightEye = <path d="M 112 82 Q 120 75 128 82" fill="none" stroke="#2c1e18" strokeWidth="4.5" strokeLinecap="round" />;
  } else if (isPatting || isEcstatic) {
    // Closed happy wedge eyes
    leftEye = <path d="M 71 82 L 80 74 L 89 82" fill="none" stroke="#2c1e18" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />;
    rightEye = <path d="M 111 82 L 120 74 L 129 82" fill="none" stroke="#2c1e18" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />;
  } else if (isSick) {
    // X shaped eyes
    leftEye = (
      <g stroke="#3a251a" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M 73 73 L 87 87" />
        <path d="M 87 73 L 73 87" />
      </g>
    );
    rightEye = (
      <g stroke="#3a251a" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M 113 73 L 127 87" />
        <path d="M 127 73 L 113 87" />
      </g>
    );
  } else if (isLonely) {
    // Drooping sad eyes
    leftEye = (
      <g>
        <ellipse cx="80" cy="80" rx="9" ry="11" fill="#fff" stroke="#2c1e18" strokeWidth="3" />
        <ellipse cx={`80`} cy={`83`} rx="5" ry="6" fill="#2c1e18" />
        <circle cx={`77`} cy={`79`} r="2" fill="#fff" />
        {/* Eyelid droop */}
        <path d="M 70 70 Q 80 81 90 70 Z" fill="#b4835a" />
      </g>
    );
    rightEye = (
      <g>
        <ellipse cx="120" cy="80" rx="9" ry="11" fill="#fff" stroke="#2c1e18" strokeWidth="3" />
        <ellipse cx={`120`} cy={`83`} rx="5" ry="6" fill="#2c1e18" />
        <circle cx={`117`} cy={`79`} r="2" fill="#fff" />
        {/* Eyelid droop */}
        <path d="M 110 70 Q 120 81 130 70 Z" fill="#b4835a" />
      </g>
    );
  } else {
    // Healthy Round Shiny Eyes
    leftEye = (
      <g>
        <circle cx="80" cy="80" r="11" fill="#2c1e18" />
        <circle cx={80 + pupilL.x} cy={80 + pupilL.y} r="8.5" fill="#1c0f0a" />
        {/* Double glisten */}
        <circle cx={77.5 + pupilL.x} cy={76.5 + pupilL.y} r="3" fill="#fff" />
        <circle cx={82.5 + pupilL.x} cy={82.5 + pupilL.y} r="1.5" fill="#fff" />
      </g>
    );
    rightEye = (
      <g>
        <circle cx="120" cy="80" r="11" fill="#2c1e18" />
        <circle cx={120 + pupilR.x} cy={80 + pupilR.y} r="8.5" fill="#1c0f0a" />
        {/* Double glisten */}
        <circle cx={117.5 + pupilR.x} cy={76.5 + pupilR.y} r="3" fill="#fff" />
        <circle cx={122.5 + pupilR.x} cy={82.5 + pupilR.y} r="1.5" fill="#fff" />
      </g>
    );
  }

  // ─── Eyebrows ───────────────────────────────────────────────────────────────
  let eyebrows = null;
  if (!isSleepy) {
    let browLeftD = "M 70 66 Q 80 64 90 68";
    let browRightD = "M 110 68 Q 120 64 130 66";

    if (isSick || isLonely) {
      // Worried eyebrows (slanting up-outward)
      browLeftD = "M 72 70 Q 80 64 88 62";
      browRightD = "M 112 62 Q 120 64 128 70";
    } else if (isEcstatic || isPatting) {
      // Excited arched eyebrows
      browLeftD = "M 68 62 Q 78 57 88 64";
      browRightD = "M 112 64 Q 122 57 132 62";
    }

    eyebrows = (
      <g stroke="#3a251a" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d={browLeftD} />
        <path d={browRightD} />
      </g>
    );
  }

  // ─── Mouth / Tongue ─────────────────────────────────────────────────────────
  let mouthAndTongue;
  if (isSleepy) {
    // Tiny closed sleeping line
    mouthAndTongue = <path d="M 94 104 Q 100 108 106 104" fill="none" stroke="#2c1e18" strokeWidth="3" strokeLinecap="round" />;
  } else if (isSick) {
    // Sick downturned frown
    mouthAndTongue = <path d="M 92 108 Q 100 101 108 108" fill="none" stroke="#3a251a" strokeWidth="3.5" strokeLinecap="round" />;
  } else if (isPatting || isEcstatic) {
    // Panting smiling mouth (shows pink tongue wiggling!)
    mouthAndTongue = (
      <g>
        {/* Open mouth */}
        <path d="M 90 100 C 90 115, 110 115, 110 100 Z" fill="#6b1d1d" stroke="#2c1e18" strokeWidth="2.5" />
        {/* Tongue */}
        <path
          d="M 93 105 C 93 118, 107 118, 107 105 Z"
          fill="#ff8585"
          className="animate-bounce"
          style={{ animationDuration: '0.4s', transformOrigin: '100px 105px' }}
        />
      </g>
    );
  } else if (isHungry) {
    // Licking lips begging mouth
    mouthAndTongue = (
      <g>
        <circle cx="100" cy="104" r="5" fill="#4d1212" stroke="#2c1e18" strokeWidth="2.5" />
        <path d="M 92 102 Q 100 105 108 102" fill="none" stroke="#2c1e18" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  } else {
    // Normal content smile
    mouthAndTongue = (
      <path d="M 93 101 Q 100 107 107 101" fill="none" stroke="#2c1e18" strokeWidth="3.5" strokeLinecap="round" />
    );
  }

  // ─── Head Parallax offset ──────────────────────────────────────────────────
  const headX = mousePos.x * 12;
  const headY = mousePos.y * 8;

  return (
    <div
      onClick={handlePat}
      className={`relative select-none cursor-pointer active:scale-95 transition-all`}
      style={{
        width: size,
        height: size,
        transform: isPatting ? 'scale(1.05, 0.93)' : 'none',
        transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {/* 🌟 CSS Animations inside style tag 🌟 */}
      <style>{`
        .tail-wag-puppy {
          transform-origin: 140px 135px;
          animation: puppyTailWag ${tailSpeed} infinite ease-in-out;
        }
        @keyframes puppyTailWag {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(15deg); }
        }

        .puppy-body-breathe {
          transform-origin: 100px 145px;
          animation: puppyBreathe ${breatheSpeed} infinite ease-in-out;
        }
        @keyframes puppyBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.03, ${breatheMaxY}); }
        }

        .head-bob-puppy {
          animation: puppyHeadBob 4s infinite ease-in-out;
        }
        @keyframes puppyHeadBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(1.5px); }
        }

        .tear-drop {
          fill: #60a5fa;
          animation: tearFall 1s linear forwards;
        }
        @keyframes tearFall {
          to { transform: translateY(15px); opacity: 0; }
        }
      `}</style>

      {/* Dynamic ambient background glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-10 pointer-events-none transition-all duration-700"
        style={{
          background: isSick
            ? '#ef4444'
            : isLonely
              ? '#c084fc'
              : isEcstatic
                ? '#10b981'
                : '#eab308',
        }}
      />

      {/* Floating particles */}
      {tears.map((t) => (
        <span
          key={t.id}
          className="absolute text-blue-400 text-lg pointer-events-none"
          style={{
            left: `${(t.x / 200) * 100}%`,
            top: `${(t.y / 200) * 100}%`,
            opacity: t.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        >
          💧
        </span>
      ))}

      {zzzs.map((z) => (
        <span
          key={z.id}
          className="absolute text-violet-400 font-extrabold pointer-events-none font-mono"
          style={{
            left: `${(z.x / 200) * 100}%`,
            top: `${(z.y / 200) * 100}%`,
            opacity: z.opacity,
            transform: `translate(-50%, -50%) scale(${z.scale})`,
            fontSize: '11px',
          }}
        >
          Zzz
        </span>
      ))}

      {extraHearts.map((h) => (
        <span
          key={h.id}
          className="absolute text-red-500 text-xl pointer-events-none animate-ping"
          style={{
            left: `${(h.x / 200) * 100}%`,
            top: `${(h.y / 200) * 100}%`,
            opacity: h.opacity,
            transform: `translate(-50%, -50%) scale(${h.scale})`,
            animationDuration: '0.9s',
          }}
        >
          ❤️
        </span>
      ))}

      {/* The main SVG Puppy */}
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        className={shiverClass}
        style={{
          filter: isSick ? 'saturate(0.5) contrast(0.9) brightness(0.95)' : 'none',
          transition: 'filter 0.5s ease',
        }}
      >
        <defs>
          {/* Shading gradients */}
          <linearGradient id="pup-fur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3ac6c" /> {/* Warm Golden brown */}
            <stop offset="100%" stopColor="#d4875a" />
          </linearGradient>
          <linearGradient id="pup-ears" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4875a" />
            <stop offset="100%" stopColor="#a66236" />
          </linearGradient>
        </defs>

        {/* 1. Tail (Wagging) */}
        <path
          d="M 140 135 C 160 110, 185 115, 180 95 C 175 75, 150 95, 135 120"
          fill="none"
          stroke="#a66236"
          strokeWidth="11"
          strokeLinecap="round"
          className="tail-wag-puppy"
        />

        {/* 2. Feet/Paws */}
        <g fill="#a66236">
          <circle cx="68" cy="172" r="14" />
          <circle cx="132" cy="172" r="14" />
          {/* Paw pads details */}
          <circle cx="68" cy="168" r="5" fill="#fbcfe8" opacity="0.4" />
          <circle cx="132" cy="168" r="5" fill="#fbcfe8" opacity="0.4" />
        </g>

        {/* 3. Body (Breathing scale animation) */}
        <g className="puppy-body-breathe">
          <ellipse cx="100" cy="138" rx="54" ry="42" fill="url(#pup-fur)" />
          {/* Soft yellow chest patch */}
          <ellipse cx="100" cy="142" rx="32" ry="24" fill="#ffebd4" />
        </g>

        {/* 4. Head Group (Floating bobbing + mouse parallax coordinates) */}
        <g
          className="head-bob-puppy"
          style={{
            transform: `translate(${headX}px, ${headY}px)`,
            transformOrigin: '100px 85px',
            transition: 'transform 0.12s ease-out',
          }}
        >
          {/* Ears (droops or perks depending on state) */}
          <g style={{ transformOrigin: '100px 85px' }}>
            {/* Left Ear */}
            <path
              d="M 38 58 C 15 58, 16 115, 42 108 C 50 102, 52 70, 48 64"
              fill="url(#pup-ears)"
              style={{
                transform: `rotate(${earAngleLeft}deg)`,
                transformOrigin: '48px 60px',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            />
            {/* Right Ear */}
            <path
              d="M 162 58 C 185 58, 184 115, 158 108 C 150 102, 148 70, 152 64"
              fill="url(#pup-ears)"
              style={{
                transform: `rotate(${earAngleRight}deg)`,
                transformOrigin: '152px 60px',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            />
          </g>

          {/* Head Base */}
          <circle cx="100" cy="85" r="47" fill="url(#pup-fur)" />

          {/* Snout patch */}
          <ellipse cx="100" cy="98" rx="22" ry="16" fill="#ffebd4" />

          {/* Cheeks Blush */}
          {(isEcstatic || isPatting) && (
            <g fill="#ff8597" opacity="0.6">
              <ellipse cx="68" cy="94" rx="10" ry="6" />
              <ellipse cx="132" cy="94" rx="10" ry="6" />
            </g>
          )}

          {/* Eyelashes / Eyelids */}
          {leftEye}
          {rightEye}

          {/* Eyebrows */}
          {eyebrows}

          {/* Nose (Chew/Munch center) */}
          <ellipse cx="100" cy="93" rx="8" ry="5.5" fill="#2c1e18" />

          {/* Mouth and tongue */}
          {mouthAndTongue}
        </g>
      </svg>

      {/* State badge overlay */}
      <div
        className="absolute top-2 right-2 border border-solid rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 backdrop-blur"
        style={{
          borderColor: isSick
            ? '#ef444455'
            : isLonely
              ? '#c084fc55'
              : isEcstatic
                ? '#10b98155'
                : '#eab30855',
          background: isSick
            ? '#ef444415'
            : isLonely
              ? '#c084fc15'
              : isEcstatic
                ? '#10b98115'
                : '#eab30815',
          color: isSick
            ? '#f87171'
            : isLonely
              ? '#c084fc'
              : isEcstatic
                ? '#34d399'
                : '#fbbf24',
        }}
      >
        <span>
          {isSick
            ? '🤒 Sick'
            : isLonely
              ? '😢 Lonely'
              : isSleepy
                ? '💤 Sleep'
                : isEcstatic
                  ? '✨ Love'
                  : '😊 Happy'}
        </span>
      </div>
    </div>
  );
}
