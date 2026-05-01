import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS } from "../lib/i18n";

const LANG_META = {
  en: { native: "English", flag: "🇬🇧" },
  es: { native: "Español", flag: "🇪🇸" },
  bn: { native: "বাংলা", flag: "🇧🇩" },
  fr: { native: "Français", flag: "🇫🇷" },
  ar: { native: "العربية", flag: "🇸🇦" },
  tl: { native: "Filipino", flag: "🇵🇭" },
};

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = (i18n.language || "en").split("-")[0];

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const switchLang = useCallback(
    (lng) => {
      i18n.changeLanguage(lng);
      setOpen(false);
    },
    [i18n],
  );

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 50 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Change language"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "transparent",
          color: "#7b5455",
          fontFamily: "'Manrope', sans-serif",
          fontSize: "0.78rem",
          fontWeight: 600,
          border: "1.5px solid rgba(210,195,196,0.5)",
          borderRadius: "9999px",
          padding: "0.35rem 0.7rem",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ffd9d8";
          e.currentTarget.style.borderColor = "#7b5455";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(210,195,196,0.5)";
        }}
      >
        <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>🌐</span>
        <span>{LANG_META[current]?.native || "English"}</span>
        <span
          style={{
            fontSize: "0.6rem",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 170,
            background: "#ffffff",
            borderRadius: "1rem",
            boxShadow:
              "0 12px 40px rgba(27,28,26,0.12), 0 2px 8px rgba(27,28,26,0.06)",
            overflow: "hidden",
            animation: "langDropIn 0.18s ease forwards",
          }}
        >
          <style>{`
            @keyframes langDropIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          {SUPPORTED_LANGS.map((lng) => {
            const meta = LANG_META[lng];
            const isActive = lng === current;
            return (
              <button
                key={lng}
                type="button"
                onClick={() => switchLang(lng)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  width: "100%",
                  padding: "0.65rem 1rem",
                  border: "none",
                  background: isActive ? "#fff5f4" : "transparent",
                  cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#7b5455" : "#3E2723",
                  transition: "background 0.12s",
                  textAlign: "left",
                  direction: lng === "ar" ? "rtl" : "ltr",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f5f3ef";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>
                  {meta?.flag}
                </span>
                <span style={{ flex: 1 }}>{meta?.native}</span>
                {isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#7b5455",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
