import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic, Volume2 } from "lucide-react";
import { duckMusic } from "../lib/audioTracks";

export default function VoiceNotePlayer({
  src,
  senderName = "",
  isPH = false,
  variant = "banner", // "banner" | "card"
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!src || typeof src !== "string" || !src.startsWith("data:audio")) return;
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      } else {
        // MediaRecorder WebM stream fix: seek to end to trigger duration calculation
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = () => {
            setCurrentTime(Math.round(audio.currentTime || 0));
          };
          audio.currentTime = 0;
          if (Number.isFinite(audio.duration)) {
            setDuration(Math.round(audio.duration));
          }
        };
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(Math.round(audio.currentTime || 0));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      duckMusic(false);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      duckMusic(false);
    };

    return () => {
      audio.pause();
      audio.src = "";
      duckMusic(false);
    };
  }, [src]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      duckMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        duckMusic(true);
      }).catch(console.error);
    }
  };

  const formatTime = (secs) => {
    if (!Number.isFinite(secs) || isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = (Number.isFinite(duration) && duration > 0)
    ? (currentTime / duration) * 100
    : 0;

  const displayTime = isPlaying
    ? formatTime(currentTime)
    : (Number.isFinite(duration) && duration > 0 ? formatTime(duration) : formatTime(currentTime));

  return (
    <div
      className={`vb-voice-player vb-voice-player-${variant}`}
      onClick={togglePlay}
      role="button"
      tabIndex={0}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.85rem",
        padding: variant === "card" ? "0.75rem 1rem" : "0.7rem 1.1rem",
        background: "linear-gradient(135deg, #ffffff 0%, #fff4f6 100%)",
        border: "1.5px solid rgba(228, 141, 156, 0.45)",
        borderRadius: "1.15rem",
        boxShadow: isPlaying
          ? "0 8px 24px rgba(225, 29, 72, 0.18), 0 2px 8px rgba(0,0,0,0.04)"
          : "0 4px 14px rgba(166, 93, 93, 0.08)",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        userSelect: "none",
        fontFamily: "'Manrope', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background progress fill */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${progressPercent}%`,
          background: "rgba(254, 205, 211, 0.35)",
          transition: "width 0.1s linear",
          pointerEvents: "none",
        }}
      />

      {/* Left: Play/Pause circle button */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: isPlaying ? "#be123c" : "#e11d48",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(225, 29, 72, 0.35)",
            transition: "transform 0.2s ease",
            transform: isPlaying ? "scale(1.05)" : "scale(1)",
            flexShrink: 0,
          }}
        >
          {isPlaying ? (
            <Pause size={17} fill="#ffffff" />
          ) : (
            <Play size={17} fill="#ffffff" style={{ marginLeft: "2px" }} />
          )}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Mic size={13} style={{ color: "#be123c" }} />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: "#881337",
                letterSpacing: "0.01em",
              }}
            >
              {senderName
                ? (isPH ? `Mensahe ng boses mula kay ${senderName}` : `Voice Note from ${senderName}`)
                : (isPH ? "Mensahe ng boses" : "Personal Voice Note")}
            </span>
          </div>
          <span style={{ fontSize: "0.7rem", color: "#9f1239", fontWeight: 600 }}>
            {isPlaying ? (isPH ? "Pinatutugtog..." : "Listening...") : (isPH ? "I-tap para pakinggan" : "Tap to listen")}
          </span>
        </div>
      </div>

      {/* Right: Waveform bars & timer */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", position: "relative", zIndex: 1 }}>
        {/* Animated sound wave bars */}
        <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "20px" }}>
          {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((heightScale, idx) => (
            <span
              key={idx}
              className="soundwave-bar"
              style={{
                display: "inline-block",
                width: "3px",
                height: isPlaying ? `${Math.max(6, 20 * heightScale)}px` : "6px",
                background: isPlaying ? "#e11d48" : "#fda4af",
                borderRadius: "9999px",
                transition: "height 0.2s ease",
                animation: isPlaying
                  ? `soundWavePulse 0.8s ease-in-out infinite alternate ${idx * 0.12}s`
                  : "none",
              }}
            />
          ))}
        </div>

        <span
          style={{
            fontSize: "0.75rem",
            fontFamily: "monospace",
            fontWeight: 700,
            color: "#881337",
            minWidth: "32px",
            textAlign: "right",
          }}
        >
          {displayTime}
        </span>
      </div>

      <style jsx>{`
        @keyframes soundWavePulse {
          0% { height: 4px; }
          50% { height: 18px; }
          100% { height: 8px; }
        }
      `}</style>
    </div>
  );
}
