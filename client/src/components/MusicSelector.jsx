import { useState, useEffect } from "react";
import { Music, Play, Square } from "lucide-react";
import { MUSIC_TRACKS, playTrack, stopTrack } from "../lib/audioTracks";

export default function MusicSelector({ selectedTrackId, onChange }) {
  const [previewingId, setPreviewingId] = useState(null);

  const handleSelect = (trackId) => {
    onChange(trackId);
    
    // Automatically preview the track when selected
    if (trackId !== "none") {
      playTrack(trackId);
      setPreviewingId(trackId);
    } else {
      stopTrack();
      setPreviewingId(null);
    }
  };

  const handleTogglePreview = (e, trackId) => {
    e.stopPropagation(); // Avoid triggering parent click
    
    if (previewingId === trackId) {
      stopTrack();
      setPreviewingId(null);
    } else {
      playTrack(trackId);
      setPreviewingId(trackId);
    }
  };

  // Stop music preview when component unmounts
  useEffect(() => {
    return () => {
      stopTrack();
    };
  }, []);

  return (
    <div 
      className="music-selector-panel"
      style={{
        padding: "1rem",
        background: "#ffffff",
        borderRadius: "1.25rem",
        border: "1px solid rgba(97, 75, 61, 0.08)",
        boxShadow: "0 4px 16px rgba(46, 35, 28, 0.03)",
        marginTop: "0.85rem",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <Music size={16} style={{ color: "#7b5455" }} />
        <h3 style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7b5455", margin: 0 }}>
          Background Music
        </h3>
      </div>
      
      <p style={{ fontSize: "0.75rem", color: "#705f58", margin: "0 0 0.85rem", lineHeight: 1.4 }}>
        Choose a track to play when the receiver opens your gift. Tap to preview.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        {MUSIC_TRACKS.map((track) => {
          const isSelected = selectedTrackId === track.id;
          const isPreviewing = previewingId === track.id;
          
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => handleSelect(track.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                textAlign: "left",
                padding: "0.6rem 0.75rem",
                borderRadius: "0.875rem",
                border: isSelected ? "2px solid #7b5455" : "1.5px solid rgba(97, 75, 61, 0.1)",
                background: isSelected ? "#fff5f4" : "#faf9f6",
                cursor: "pointer",
                transition: "all 0.18s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(123, 84, 85, 0.4)";
                  e.currentTarget.style.background = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "rgba(97, 75, 61, 0.1)";
                  e.currentTarget.style.background = "#faf9f6";
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#312722" }}>
                  {track.name}
                </span>
                
                {track.id !== "none" && (
                  <button
                    type="button"
                    onClick={(e) => handleTogglePreview(e, track.id)}
                    style={{
                      border: "none",
                      background: isPreviewing ? "#7b5455" : "rgba(123, 84, 85, 0.08)",
                      color: isPreviewing ? "#fff" : "#7b5455",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.15s",
                    }}
                    title={isPreviewing ? "Stop Preview" : "Preview Track"}
                  >
                    {isPreviewing ? <Square size={8} fill="currentColor" /> : <Play size={8} fill="currentColor" />}
                  </button>
                )}
              </div>
              
              <span style={{ fontSize: "0.65rem", color: "#8a7670", marginTop: "0.2rem", lineHeight: 1.2 }}>
                {track.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
