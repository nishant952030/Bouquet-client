/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { playTrack, stopTrack, getAudioInstance, getMuteState, setMuteState } from "../lib/audioTracks";

export default function MusicPlayer({ trackId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  useEffect(() => {
    if (!trackId || trackId === "none") {
      stopTrack();
      setIsPlaying(false);
      return;
    }

    // Play the track
    playTrack(trackId);
    
    const audio = getAudioInstance();
    if (audio) {
      setIsMuted(audio.muted);
      
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);

      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);

      // Try autoplaying on user interaction if blocked
      const handleUserInteraction = () => {
        if (audio.paused) {
          audio.play()
            .then(() => {
              setIsPlaying(true);
              removeInteractionListeners();
            })
            .catch(() => {});
        } else {
          removeInteractionListeners();
        }
      };

      const removeInteractionListeners = () => {
        window.removeEventListener("click", handleUserInteraction);
        window.removeEventListener("touchstart", handleUserInteraction);
        window.removeEventListener("keydown", handleUserInteraction);
      };

      window.addEventListener("click", handleUserInteraction);
      window.addEventListener("touchstart", handleUserInteraction);
      window.addEventListener("keydown", handleUserInteraction);

      // Check if already playing
      if (!audio.paused) {
        setIsPlaying(true);
      }

      return () => {
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        removeInteractionListeners();
      };
    }
  }, [trackId]);

  if (!trackId || trackId === "none") return null;

  const handleTogglePlay = () => {
    const audio = getAudioInstance();
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Unmute if muted when clicking play, to ensure sound is heard
      if (audio.muted) {
        setMuteState(false);
        setIsMuted(false);
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation(); // Avoid triggering play/pause toggle
    const audio = getAudioInstance();
    if (!audio) return;

    const newMute = !isMuted;
    setMuteState(newMute);
    setIsMuted(newMute);
    
    // If we unmute, make sure it's playing
    if (!newMute && audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div 
      className="music-player-float"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "rgba(251, 249, 245, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(97, 75, 61, 0.12)",
        borderRadius: "9999px",
        padding: "0.4rem 0.75rem",
        boxShadow: "0 8px 24px rgba(46, 35, 28, 0.08)",
        cursor: "pointer",
        userSelect: "none",
        fontFamily: "'Manrope', sans-serif",
        color: "#5c4940",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onClick={handleTogglePlay}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(46, 35, 28, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(46, 35, 28, 0.08)";
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes eqBounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .music-eq-bar {
          width: 2.5px;
          height: 12px;
          background-color: currentColor;
          border-radius: 99px;
          transform-origin: bottom;
        }
        .music-eq-1 { animation: eqBounce 0.8s ease-in-out infinite; }
        .music-eq-2 { animation: eqBounce 0.5s ease-in-out infinite 0.15s; }
        .music-eq-3 { animation: eqBounce 0.7s ease-in-out infinite 0.3s; }
        .music-eq-4 { animation: eqBounce 0.6s ease-in-out infinite 0.08s; }
      `}} />

      {/* Play/Pause Equalizer State */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "12px", width: "16px", marginRight: "2px" }}>
        {isPlaying && !isMuted ? (
          <>
            <div className="music-eq-bar music-eq-1" />
            <div className="music-eq-bar music-eq-2" />
            <div className="music-eq-bar music-eq-3" />
            <div className="music-eq-bar music-eq-4" />
          </>
        ) : (
          <Music size={14} style={{ color: "#7b5455" }} />
        )}
      </div>

      <span style={{ fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.02em", color: "#3E2723" }}>
        {isPlaying ? "Music" : "Music paused"}
      </span>

      {/* Mute button */}
      <button
        onClick={handleToggleMute}
        style={{
          background: "none",
          border: "none",
          padding: "2px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isMuted ? "#be185d" : "#7b5455",
          marginLeft: "4px",
          borderRadius: "50%",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(123, 84, 85, 0.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </div>
  );
}
