import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { applySeo } from "../lib/seo";

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&family=Manrope:wght@400;500;600;700&display=swap');

  .vc-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 2rem 1rem;
    overflow: hidden;
    position: relative;
    font-family: 'Manrope', sans-serif;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Transition to day mode when candles are out */
  .vc-root.lights-on {
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    transition: background 2s ease-in-out;
  }

  /* ── Title ── */
  .vc-title {
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 100%;
    z-index: 10;
  }
  .vc-title h1 {
    font-family: 'Caveat', cursive;
    font-size: 3.5rem;
    color: #fff;
    text-shadow: 0 2px 10px rgba(255,255,255,0.3);
    margin: 0;
    line-height: 1.1;
    transition: color 2s;
  }
  .lights-on .vc-title h1 {
    color: #333;
    text-shadow: none;
  }
  .vc-hint {
    font-family: 'Manrope', sans-serif;
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
    margin-top: 0.5rem;
    letter-spacing: 0.5px;
    animation: pulse 2s infinite;
  }
  .lights-on .vc-hint {
    opacity: 0;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; text-shadow: 0 0 8px rgba(255,255,255,0.8); }
  }

  /* ── Scene ── */
  .cake-scene {
    position: relative;
    margin-top: 10vh;
    width: 300px;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    z-index: 5;
  }

  /* ── The Cake ── */
  .plate {
    width: 260px;
    height: 30px;
    background: #e0e0e0;
    border-radius: 50%;
    position: absolute;
    bottom: -15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    border-bottom: 4px solid #bdbdbd;
  }
  .lights-on .plate {
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }

  .cake {
    position: relative;
    width: 200px;
    height: 80px;
    border-radius: 10px 10px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    z-index: 2;
  }

  .cake-layer {
    width: 100%;
    height: 40px;
    position: relative;
  }

  /* Flavor Themes */
  .flavor-chocolate .cake-layer { background: #4e342e; }
  .flavor-chocolate .frosting { background: #3e2723; }
  .flavor-chocolate .drip { background: #3e2723; }

  .flavor-vanilla .cake-layer { background: #ffecb3; }
  .flavor-vanilla .frosting { background: #fff9c4; }
  .flavor-vanilla .drip { background: #fff9c4; }

  .flavor-strawberry .cake-layer { background: #f8bbd0; }
  .flavor-strawberry .frosting { background: #f06292; }
  .flavor-strawberry .drip { background: #f06292; }

  /* Frosting & Drips */
  .frosting {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 20px;
    border-radius: 10px 10px 0 0;
  }
  .drips {
    position: absolute;
    top: 15px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
  .drip {
    width: 15px;
    border-radius: 0 0 10px 10px;
  }
  .drip:nth-child(1) { height: 25px; }
  .drip:nth-child(2) { height: 15px; }
  .drip:nth-child(3) { height: 30px; }
  .drip:nth-child(4) { height: 20px; }
  .drip:nth-child(5) { height: 10px; }
  .drip:nth-child(6) { height: 25px; }
  .drip:nth-child(7) { height: 15px; }

  /* Sprinkle decorations */
  .sprinkles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    border-radius: 10px 10px 0 0;
  }
  .sprinkle {
    position: absolute;
    width: 4px;
    height: 10px;
    border-radius: 2px;
  }

  /* ── Candles ── */
  .candles-container {
    position: absolute;
    bottom: 75px; /* Aligns perfectly so candles sink slightly into the 80px tall cake */
    width: 160px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 10px;
    z-index: 3;
    pointer-events: none; /* Let taps fall through if needed, but candles are interactive */
  }

  .candle-wrapper {
    position: relative;
    width: 12px;
    height: 40px;
    cursor: pointer;
    pointer-events: auto;
    transition: transform 0.1s;
  }
  .candle-wrapper:active {
    transform: scale(0.95);
  }
  
  .candle-stick {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      #fff,
      #fff 4px,
      #f44336 4px,
      #f44336 8px
    );
    border-radius: 3px;
    box-shadow: inset -2px 0 2px rgba(0,0,0,0.1);
  }

  .wick {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 6px;
    background: #333;
  }

  /* The Flame */
  .flame {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 20px;
    background: #ffeb3b;
    border-radius: 50% 50% 20% 20%;
    box-shadow: 
      0 0 10px #ffeb3b,
      0 0 20px #ff9800,
      0 0 40px #f44336;
    animation: flicker 0.1s infinite alternate;
    transform-origin: bottom center;
  }
  .candle-wrapper.out .flame {
    display: none;
  }

  @keyframes flicker {
    0% { transform: translateX(-50%) scale(1) rotate(-1deg); opacity: 0.9; }
    100% { transform: translateX(-50%) scale(1.05) rotate(2deg); opacity: 1; }
  }

  /* Smoke */
  .smoke {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background: rgba(255,255,255,0.5);
    border-radius: 50%;
    opacity: 0;
  }
  .candle-wrapper.out .smoke {
    animation: puff 1s ease-out forwards;
  }

  @keyframes puff {
    0% { opacity: 0.8; transform: translate(-50%, 0) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -40px) scale(3); }
  }

  /* ── Note Reveal ── */
  .note-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    width: 90%;
    max-width: 400px;
    background: #fff;
    padding: 2.5rem 2rem;
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .note-card.visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    pointer-events: auto;
  }
  .note-text {
    font-family: 'Patrick Hand', cursive;
    font-size: 1.5rem;
    color: #333;
    line-height: 1.4;
    text-align: center;
    white-space: pre-wrap;
  }

  /* ── Viral CTA ── */
  .viral-cta {
    margin-top: 2rem;
    text-align: center;
  }
  .viral-btn {
    display: inline-block;
    background: #e91e63;
    color: #fff;
    padding: 0.8rem 1.5rem;
    border-radius: 99px;
    font-weight: 600;
    text-decoration: none;
    font-size: 0.9rem;
    transition: transform 0.2s, background 0.2s;
  }
  .viral-btn:hover {
    background: #d81b60;
    transform: translateY(-2px);
  }

  /* ── Confetti ── */
  .confetti-piece {
    position: fixed;
    width: 10px;
    height: 20px;
    top: -20px;
    z-index: 90;
    opacity: 0;
  }
  .lights-on .confetti-piece {
    animation: fall var(--dur) linear forwards var(--delay);
  }
  @keyframes fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }
`;

function Confetti() {
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
  const pieces = [];
  
  for(let i = 0; i < 50; i++) {
    pieces.push(
      <div 
        key={i} 
        className="confetti-piece"
        style={{
          left: `${Math.random() * 100}vw`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          '--dur': `${2 + Math.random() * 3}s`,
          '--delay': `${Math.random() * 1}s`,
          borderRadius: Math.random() > 0.5 ? '50%' : '0',
          width: `${5 + Math.random() * 8}px`,
          height: `${5 + Math.random() * 15}px`,
        }}
      />
    );
  }
  return <>{pieces}</>;
}

export default function ViewCake() {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  
  // State for candles
  const [candlesOut, setCandlesOut] = useState([]);
  const [allOut, setAllOut] = useState(false);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const encodedData = searchParams.get('d');
      if (encodedData) {
        const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
        setData(decoded);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error("Failed to decode cake data", e);
      setError(true);
    }
  }, [location]);

  useEffect(() => {
    if (data) {
      applySeo({
        title: `Happy Birthday ${data.n}! 🎂`,
        description: `You've received a virtual birthday cake. Open it to blow out the candles!`,
        path: location.pathname + location.search,
        robots: "noindex,nofollow", // Don't index personal gift links
      });
    }
  }, [data, location]);

  const hasPlayed = useRef(false);

  const playBirthdayTune = () => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Ensure the audio context is active (required by some browsers)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.8; // Set overall volume louder
      masterGain.connect(ctx.destination);
      
      // Happy Birthday Melody (Frequencies)
      const melody = [
        { f: 392.00, d: 0.5 }, { f: 392.00, d: 0.5 }, { f: 440.00, d: 1 }, { f: 392.00, d: 1 }, { f: 523.25, d: 1 }, { f: 493.88, d: 2 },
        { f: 392.00, d: 0.5 }, { f: 392.00, d: 0.5 }, { f: 440.00, d: 1 }, { f: 392.00, d: 1 }, { f: 587.33, d: 1 }, { f: 523.25, d: 2 },
        { f: 392.00, d: 0.5 }, { f: 392.00, d: 0.5 }, { f: 783.99, d: 1 }, { f: 659.25, d: 1 }, { f: 523.25, d: 1 }, { f: 493.88, d: 1 }, { f: 440.00, d: 1 },
        { f: 698.46, d: 0.5 }, { f: 698.46, d: 0.5 }, { f: 659.25, d: 1 }, { f: 523.25, d: 1 }, { f: 587.33, d: 1 }, { f: 523.25, d: 2 }
      ];

      // Schedule slightly in the future to avoid initial clipping
      let time = ctx.currentTime + 0.1;
      const beat = 0.4;
      
      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle'; // Smooth piano/music-box sound
        osc.frequency.value = note.f;
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(1, time + 0.02); // Louder attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + (note.d * beat) - 0.05);
        
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc.start(time);
        osc.stop(time + note.d * beat);
        
        time += note.d * beat;
      });
    } catch(e) {
      console.warn("Audio not supported or blocked", e);
    }
  };

  const toggleCandle = (idx) => {
    if (allOut) return;
    playBirthdayTune();
    
    setCandlesOut(prev => {
      const next = [...prev];
      if (!next.includes(idx)) {
        next.push(idx);
        
        // Check if all are out
        const totalCandles = Math.min(Math.max(data.a || 3, 1), 10);
        if (next.length >= totalCandles) {
          setTimeout(() => setAllOut(true), 500); // Small delay before day mode
        }
      }
      return next;
    });
  };

  const blowOutAll = () => {
    if (allOut) return;
    playBirthdayTune();
    const totalCandles = Math.min(Math.max(data?.a || 3, 1), 10);
    const allIdx = Array.from({ length: totalCandles }).map((_, i) => i);
    setCandlesOut(allIdx);
    setTimeout(() => setAllOut(true), 500);
  };

  // Generate sprinkles
  const sprinkles = useMemo(() => {
    const s = [];
    const colors = ['#fff', '#ffeb3b', '#ff4081', '#00e5ff', '#b2ff59'];
    for(let i = 0; i < 30; i++) {
      s.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        bg: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360
      });
    }
    return s;
  }, []);

  if (error) {
    return <Navigate to="/create-cake" replace />;
  }

  if (!data) return null; // Loading

  const { n: name, f: flavor, a: age, m: note } = data;
  const numCandles = Math.min(Math.max(age || 3, 1), 10); // cap at 10 for UI layout

  return (
    <main className={`vc-root ${allOut ? 'lights-on' : ''}`}>
      <style>{CSS}</style>

      {allOut && <Confetti />}

      <div className="vc-title">
        <h1>Happy Birthday,<br/>{name}!</h1>
        {!allOut && (
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={blowOutAll}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-full text-white font-semibold shadow-lg transition-all"
            >
              Blow out the candles! 💨
            </button>
            <p className="vc-hint" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>(Or tap them one by one)</p>
          </div>
        )}
      </div>

      <div className="cake-scene">
        
        {/* Candles */}
        <div className="candles-container">
          {Array.from({ length: numCandles }).map((_, i) => {
            const isOut = candlesOut.includes(i);
            return (
              <div 
                key={i} 
                className={`candle-wrapper ${isOut ? 'out' : ''}`}
                onClick={() => toggleCandle(i)}
                // Stagger candle heights slightly
                style={{ bottom: i % 2 === 0 ? '5px' : '0' }} 
              >
                <div className="flame"></div>
                <div className="smoke"></div>
                <div className="wick"></div>
                <div className="candle-stick"></div>
              </div>
            );
          })}
        </div>

        {/* The Cake */}
        <div className={`cake flavor-${flavor}`}>
          <div className="cake-layer">
            <div className="frosting"></div>
            <div className="drips">
              {Array.from({length: 7}).map((_, i) => <div key={i} className="drip"></div>)}
            </div>
            {/* Sprinkles on middle layer */}
            <div className="sprinkles">
              {sprinkles.slice(0, 15).map((s, i) => (
                <div key={i} className="sprinkle" style={{left: s.left, top: s.top, backgroundColor: s.bg, transform: `rotate(${s.rot}deg)`}}></div>
              ))}
            </div>
          </div>
          <div className="cake-layer">
            <div className="sprinkles">
              {sprinkles.slice(15, 30).map((s, i) => (
                <div key={i} className="sprinkle" style={{left: s.left, top: s.top, backgroundColor: s.bg, transform: `rotate(${s.rot}deg)`}}></div>
              ))}
            </div>
          </div>
        </div>
        <div className="plate"></div>
      </div>

      {/* Note Reveal */}
      <div className={`note-card ${allOut ? 'visible' : ''}`}>
        <p className="note-text">{note || "Wishing you a wonderful year ahead!"}</p>
        
        <div className="viral-cta">
          <Link to="/create-cake" className="viral-btn">
            Send a cake to someone else 🎂
          </Link>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-stone-400 hover:text-rose-500 font-medium">
              Made with Petals & Words
            </Link>
          </div>
        </div>
      </div>
      
    </main>
  );
}
