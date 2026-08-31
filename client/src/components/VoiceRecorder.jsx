import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Trash2, Volume2 } from "lucide-react";

export default function VoiceRecorder({ voiceNote, onChange, isPH = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const previewAudioRef = useRef(null);

  const MAX_SECONDS = 45;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Setup preview audio instance when voiceNote changes
  useEffect(() => {
    if (!voiceNote || typeof voiceNote !== "string" || !voiceNote.startsWith("data:audio")) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setIsPlayingPreview(false);
      setPreviewCurrentTime(0);
      setPreviewDuration(0);
      return;
    }

    const audio = new Audio(voiceNote);
    previewAudioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setPreviewDuration(Math.round(audio.duration));
      } else {
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = () => {
            setPreviewCurrentTime(Math.round(audio.currentTime || 0));
          };
          audio.currentTime = 0;
          if (Number.isFinite(audio.duration)) {
            setPreviewDuration(Math.round(audio.duration));
          }
        };
      }
    };

    audio.ontimeupdate = () => {
      setPreviewCurrentTime(Math.round(audio.currentTime || 0));
    };

    audio.onended = () => {
      setIsPlayingPreview(false);
      setPreviewCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPlayingPreview(false);
    };

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [voiceNote]);

  const startRecording = async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          onChange(base64Audio);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start(250); // collect 250ms chunks
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setErrorMsg(
        isPH
          ? "Kailangan ng permiso sa mikropono para mag-record ng boses."
          : "Microphone permission is required to record a voice note."
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePreview = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(console.error);
    }
  };

  const deleteRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsPlayingPreview(false);
    onChange(null);
  };

  const formatTime = (secs) => {
    if (!Number.isFinite(secs) || isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="voice-recorder-panel"
      style={{
        padding: "1rem",
        background: "#ffffff",
        borderRadius: "1.25rem",
        border: "1px solid rgba(228, 141, 156, 0.25)",
        boxShadow: "0 4px 16px rgba(46, 35, 28, 0.03)",
        marginTop: "0.85rem",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Mic size={16} style={{ color: "#c0605a" }} />
          <h3 style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7b5455", margin: 0 }}>
            {isPH ? "Mensahe ng Boses (Voice Note)" : "Personal Voice Note"}
          </h3>
        </div>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "#fef2f2", color: "#dc2626" }}>
          {isPH ? "Opsyonal ✨" : "Optional ✨"}
        </span>
      </div>

      <p style={{ fontSize: "0.75rem", color: "#705f58", margin: "0 0 0.85rem", lineHeight: 1.4 }}>
        {isPH
          ? "I-record ang iyong tunay na boses (hanggang 45s). Maririnig ito ng iyong recipient habang bumubuka ang bulaklak!"
          : "Record your actual voice (up to 45s). Your recipient will hear your message as the flowers bloom!"}
      </p>

      {errorMsg && (
        <div style={{ padding: "0.5rem 0.75rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "0.75rem", color: "#991b1b", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
          {errorMsg}
        </div>
      )}

      {/* State 1: Ready to record (no voice note yet) */}
      {!voiceNote && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e6 100%)",
            border: "1.5px dashed #f43f5e",
            borderRadius: "0.875rem",
            color: "#9f1239",
            fontWeight: 700,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe4e6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #fff5f5 0%, #ffe4e6 100%)")}
        >
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#e11d48" }} />
          <span>{isPH ? "I-tap para mag-record ng boses 🎙️" : "Tap to Record Voice Note 🎙️"}</span>
        </button>
      )}

      {/* State 2: Actively recording */}
      {isRecording && (
        <div
          style={{
            padding: "0.85rem 1rem",
            background: "#fff1f2",
            border: "1.5px solid #fb7185",
            borderRadius: "0.875rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#e11d48",
                animation: "pulseRed 1s infinite alternate",
              }}
            />
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#be123c", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {isPH ? "Nagre-record..." : "Recording..."}
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#881337", fontFamily: "monospace" }}>
                {formatTime(recordingSeconds)} / {formatTime(MAX_SECONDS)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            style={{
              padding: "0.55rem 1rem",
              background: "#e11d48",
              color: "#ffffff",
              border: "none",
              borderRadius: "9999px",
              fontWeight: 800,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(225, 29, 72, 0.3)",
            }}
          >
            <Square size={13} fill="#ffffff" />
            <span>{isPH ? "Tapos Na" : "Done"}</span>
          </button>
        </div>
      )}

      {/* State 3: Recorded voice note ready for preview */}
      {voiceNote && !isRecording && (
        <div
          style={{
            padding: "0.85rem 1rem",
            background: "linear-gradient(135deg, #fdf8f6 0%, #fff1f2 100%)",
            border: "1.5px solid #fecdd3",
            borderRadius: "0.875rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
            <button
              type="button"
              onClick={togglePreview}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#e11d48",
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                shrink: 0,
                boxShadow: "0 2px 8px rgba(225, 29, 72, 0.25)",
              }}
              title={isPlayingPreview ? "Pause" : "Play"}
            >
              {isPlayingPreview ? <Pause size={16} fill="#ffffff" /> : <Play size={16} fill="#ffffff" style={{ marginLeft: "2px" }} />}
            </button>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#881337" }}>
                  {isPlayingPreview ? (isPH ? "Pinatutugtog..." : "Playing...") : (isPH ? "Voice Memo Naka-save ✓" : "Voice Note Saved ✓")}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#9f1239", fontFamily: "monospace" }}>
                  {formatTime(previewCurrentTime)} / {formatTime(previewDuration || recordingSeconds || 0)}
                </span>
              </div>

              {/* Mini progress track */}
              <div style={{ width: "100%", height: "4px", background: "rgba(225, 29, 72, 0.15)", borderRadius: "9999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#e11d48",
                    width: previewDuration > 0 ? `${(previewCurrentTime / previewDuration) * 100}%` : "0%",
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <button
              type="button"
              onClick={startRecording}
              title={isPH ? "I-record muli" : "Re-record"}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #fecdd3",
                color: "#705f58",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
            </button>

            <button
              type="button"
              onClick={deleteRecording}
              title={isPH ? "Tanggalin" : "Remove"}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #fecdd3",
                color: "#be123c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulseRed {
          from { opacity: 0.4; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
