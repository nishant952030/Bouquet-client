import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import CakeScene from "../components/cake3d/CakeScene.jsx";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { applySeo } from "../lib/seo";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Patrick+Hand&family=Manrope:wght@400;500;600;700&display=swap');

  .vc-3d-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    font-family: 'Manrope', sans-serif;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    position: relative;
  }

  .vc-3d-wrap {
    width: min(960px, 100%);
    display: grid;
    gap: 1rem;
    justify-items: center;
    position: relative;
  }

  .vc-3d-title {
    text-align: center;
    z-index: 2;
  }

  .vc-3d-title h1 {
    font-family: 'Caveat', cursive;
    font-size: clamp(2.5rem, 9vw, 4.5rem);
    line-height: 1;
    margin: 0 0 0.5rem;
    text-shadow: 0 8px 24px rgba(0,0,0,0.24);
  }

  .vc-3d-canvas {
    width: min(720px, 100%);
    height: min(62vh, 520px);
    min-height: 360px;
    border-radius: 24px;
    box-shadow: 0 24px 70px rgba(0,0,0,0.26);
    position: relative;
    overflow: hidden;
  }

.note-card {
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 50;
    width: 90%;
    max-width: 380px;
    background: linear-gradient(145deg, #fff 0%, #fef9f9 100%);
    border-radius: 1.5rem;
    padding: 2rem 1.5rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
    text-align: center;
    animation: noteRise 0.6s ease-out;
  }

  .vc-3d-note-btn {
    border: 1px solid rgba(255,255,255,0.42);
    border-radius: 999px;
    background: rgba(255,255,255,0.16);
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    padding: 0.72rem 1.35rem;
    backdrop-filter: blur(12px);
  }

  .note-text {
    font-family: 'Patrick Hand', cursive;
    font-size: 1.5rem;
    color: #333;
    line-height: 1.4;
    text-align: center;
    white-space: pre-wrap;
  }

  @keyframes noteRise {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

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

  .made-with-link {
    display: inline-block;
    margin-top: 1rem;
    color: #a8a29e;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
  }

  .made-with-link:hover {
    color: #f43f5e;
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
    .vc-3d-root {
      padding: 0.5rem;
      align-items: flex-start;
      padding-top: 1rem;
    }

    .vc-3d-wrap {
      gap: 0.5rem;
    }

.vc-3d-title h1 {
      font-size: 2.25rem;
    }

    .note-card {
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 92%;
      padding: 1rem;
      border-radius: 1rem;
    }

    .note-text {
      font-size: 1rem;
    }

    .viral-btn {
      padding: 0.6rem 1rem;
      font-size: 0.8rem;
    }
  }
`;

function withIds(items, prefix, mapper = (item) => item) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({ id: `${prefix}-${index}`, ...mapper(item) }));
}

function getSharedCakeFromLocalStorage(id) {
  try {
    const raw = localStorage.getItem(`cake_share_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Confetti() {
  const colors = ["#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#2196f3", "#00bcd4", "#4caf50", "#ffeb3b", "#ff9800"];

  return Array.from({ length: 50 }, (_, index) => (
    <div
      className="confetti-piece"
      key={index}
      style={{
        left: `${Math.random() * 100}vw`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        "--dur": `${2 + Math.random() * 3}s`,
        "--delay": `${Math.random()}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
        width: `${5 + Math.random() * 8}px`,
        height: `${5 + Math.random() * 15}px`,
      }}
    />
  ));
}

export default function ViewCake() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [candlesOut, setCandlesOut] = useState([]);
  const tunePlayedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadCake = async () => {
      if (!id) {
        setError(true);
        setIsLoading(false);
        return;
      }

      try {
        if (isFirebaseConfigured && db) {
          let snapshot;
          try {
            snapshot = await getDocFromServer(doc(db, "cakes", id));
          } catch (serverError) {
            console.warn("Server cake fetch failed, falling back to cached Firestore read.", serverError);
            snapshot = await getDoc(doc(db, "cakes", id));
          }

          if (snapshot.exists()) {
            if (!cancelled) setData(snapshot.data());
            return;
          }
        }

        const localData = getSharedCakeFromLocalStorage(id);
        if (!cancelled) {
          if (localData) setData(localData);
          else setError(true);
        }
      } catch (err) {
        console.error("Unable to read shared cake", err);
        const localData = getSharedCakeFromLocalStorage(id);
        if (!cancelled) {
          if (localData) setData(localData);
          else setError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadCake();
    return () => { cancelled = true; };
  }, [id]);

  const OCCASION_TITLES = {
    "birthday": "Happy Birthday",
    "mothers-day": "Happy Mother's Day",
    "fathers-day": "Happy Father's Day",
    "anniversary": "Happy Anniversary",
    "wedding": "Wedding Wishes",
    "graduation": "Congratulations",
    "baby-shower": "Baby Sprinkle",
    "just-because": "For You",
    "thank-you": "Thank You",
  };

  const getOccasionTitle = (occasion) => OCCASION_TITLES[occasion] || "Happy Celebration";

  useEffect(() => {
    if (!data) return;
    const title = `${getOccasionTitle(data.occasion)} ${data.name || "to you"}! 🎂`;
    applySeo({
      title,
      description: `You've received a virtual cake for ${data.occasion || "a special occasion"}. Open it to read your note!`,
      path: location.pathname + location.search,
      robots: "noindex,nofollow",
    });
  }, [data, location]);

  if (error) return <Navigate to="/create-cake" replace />;
  if (isLoading || !data) return null;

  const name = data.name || "you";
  const note = data.note || "Wishing you a wonderful year ahead!";
  const occasionTitle = getOccasionTitle(data.occasion);
  const tiers = Math.min(Math.max(Number(data.tiers) || 1, 1), 3);
  const candles = withIds(data.candles, "candle");
  const creamSwirls = withIds(data.creamSwirls, "cream");
  const toppings = withIds(data.toppings, "topping", (item) => ({
    type: item?.type || "cherry",
    x: Number(item?.x || 0),
    y: Number(item?.y || 0),
    z: Number(item?.z || 0),
    rotation: Number(item?.rotation || 0),
    colorIndex: Number(item?.colorIndex || 0),
  }));
  const allCandlesOut = candles.length > 0 && candlesOut.length >= candles.length;

  const playBirthdayTune = () => {
    if (tunePlayedRef.current) return;
    tunePlayedRef.current = true;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === "suspended") ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.38;
      masterGain.connect(ctx.destination);

      const notes = [
        [392, 0.35], [392, 0.35], [440, 0.7], [392, 0.7], [523.25, 0.7], [493.88, 1.15],
        [392, 0.35], [392, 0.35], [440, 0.7], [392, 0.7], [587.33, 0.7], [523.25, 1.15],
        [392, 0.35], [392, 0.35], [783.99, 0.7], [659.25, 0.7], [523.25, 0.7], [493.88, 0.7], [440, 1],
        [698.46, 0.35], [698.46, 0.35], [659.25, 0.7], [523.25, 0.7], [587.33, 0.7], [523.25, 1.2],
      ];

      let time = ctx.currentTime + 0.05;
      notes.forEach(([frequency, duration]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.75, time + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration - 0.03);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(time);
        osc.stop(time + duration);
        time += duration;
      });
    } catch (err) {
      console.warn("Birthday tune could not play", err);
    }
  };

  const blowCandle = (candleId) => {
    playBirthdayTune();
    setCandlesOut((current) => current.includes(candleId) ? current : [...current, candleId]);
  };

  const blowAllCandles = () => {
    playBirthdayTune();
    setCandlesOut(candles.map((candle) => candle.id));
  };

  return (
    <main className="vc-3d-root">
      <style>{CSS}</style>
      {allCandlesOut && <Confetti />}

      <div className="vc-3d-wrap">
        <div className="vc-3d-title">
          <h1>{occasionTitle},<br />{name}!</h1>
          {!allCandlesOut && (
            <button className="vc-3d-note-btn" onClick={blowAllCandles} type="button">
              Blow out the candles
            </button>
          )}
        </div>

        <div className="vc-3d-canvas">
          <CakeScene
            autoRotate={!allCandlesOut}
            candles={candles}
            creamSwirls={creamSwirls}
            extinguishedCandleIds={candlesOut}
            flavor={data.flavor || "chocolate"}
            onCandleBlow={blowCandle}
            readOnly
            tiers={tiers}
            toppings={toppings}
          />
          {allCandlesOut && (
          <div className="note-card">
            <p className="note-text">{note}</p>
            <div className="viral-cta">
              <Link to="/create-cake" className="viral-btn">
                Send a cake to someone else 🎂
              </Link>
              <Link to="/" className="made-with-link">
                Made with Petals & Words
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>
    </main>
  );
}
