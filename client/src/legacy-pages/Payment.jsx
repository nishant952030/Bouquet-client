import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { track } from "@vercel/analytics";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { trackEvent } from "../lib/analytics";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo, seoKeywords } from "../lib/seo";
import { clearCheckoutDraft, loadCheckoutDraft } from "../lib/checkoutStorage";
import RecipientBouquetCanvas from "../components/RecipientBouquetCanvas";

/* -- constants -- */
const PENDING_KEY = "pw_pending_global_checkout";

const TIP_PRESET_INR = { label: "Standard", amount: 49, display: "Rs 49" };
const TIP_PRESET_USD = { label: "Standard", amount: 1.99, display: "$1.99" };
const API_BASE_URL = String((typeof process !== "undefined" && process.env && process.env.VITE_API_BASE_URL) || "").replace(/\/+$/, "");

/* -- helpers -- */
function countWords(text) {
  const n = String(text || "").trim();
  return n ? n.split(/\s+/).length : 0;
}
function trackEv(name, payload) {
  track(name, payload);
  trackEvent(name, payload);
}
function getLikelyCountryFromClient() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = String(navigator?.language || "").toUpperCase();
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || locale.includes("-IN")) return "IN";
    return "OTHER";
  } catch {
    return "IN";
  }
}
function getPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return Array.isArray(p?.stems) ? p : null;
  } catch { return null; }
}
async function readApi(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { return await res.json(); } catch { return null; }
  }
  try { const t = await res.text(); return t ? { error: t } : null; } catch { return null; }
}
function apiUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

/* -- CSS -- */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .tip-root {
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
    background: linear-gradient(160deg, #fdf6f0 0%, #f8edf0 55%, #fdf0f5 100%);
    color: #3E2723;
  }

  /* Modern Floating Glassmorphism Pill Header */
  .tip-header {
    position: sticky; top: 12px; z-index: 50;
    max-width: 1060px; margin: 0 auto 0.75rem; width: calc(100% - 24px);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    background: rgba(255, 255, 255, 0.82);
    border: 1.5px solid rgba(255, 255, 255, 0.95);
    border-radius: 9999px;
    box-shadow: 0 12px 32px rgba(124, 63, 79, 0.12);
    overflow: hidden;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .au   { animation: fadeUp .5s cubic-bezier(0.34,1.3,0.64,1) forwards; }
  .au-1 { animation-delay:.05s; opacity:0; }
  .au-2 { animation-delay:.15s; opacity:0; }
  .au-3 { animation-delay:.25s; opacity:0; }
  .au-4 { animation-delay:.35s; opacity:0; }
  .au-5 { animation-delay:.45s; opacity:0; }

  @keyframes checkPop {
    0%  { transform:scale(0) rotate(-10deg); opacity:0; }
    70% { transform:scale(1.2) rotate(4deg);  opacity:1; }
    100%{ transform:scale(1) rotate(0deg);    opacity:1; }
  }
  .check-pop { animation: checkPop .5s cubic-bezier(.34,1.56,.64,1) forwards; }

  /* Glass cards */
  .vv-card {
    background: rgba(255,255,255,0.78);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(200,130,140,0.10), 0 2px 8px rgba(200,100,100,0.06);
    overflow: hidden;
  }
  .vv-card-low { background: rgba(255,243,240,0.6); backdrop-filter: blur(12px); border-radius: 1.5rem; }

  .vv-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem; font-weight: 800;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #a65d5d;
  }

  /* Tip amount buttons */
  .tip-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
    background: rgba(255,255,255,0.7);
    border: 2px solid rgba(200,130,140,0.18);
    border-radius: 1rem;
    padding: 0.85rem 0.5rem;
    cursor: pointer;
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s;
    min-width: 0;
    flex: 1;
  }
  .tip-btn:hover { border-color: rgba(166,93,93,0.4); background: #fff5f4; transform: translateY(-1px); }
  .tip-btn.selected { border-color: #a65d5d; background: #fff5f4; box-shadow: 0 0 0 3px rgba(166,93,93,0.12); }
  .tip-btn .tip-emoji { font-size: 1.3rem; line-height: 1; }
  .tip-btn .tip-amount { font-size: 0.92rem; font-weight: 700; color: #3E2723; }

  /* Shimmer send button — matches landing page */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .tip-cta {
    width: 100%; min-height: 54px;
    border-radius: 9999px;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #ffffff;
    border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.18s ease;
    animation: pw-pulse 2.5s infinite;
  }
  .tip-cta:hover:not(:disabled) { transform: translateY(-2px); }
  .tip-cta:active:not(:disabled) { transform: scale(0.98); }
  .tip-cta:disabled { background: #e4e2de; color: #9e8f90; cursor: not-allowed; box-shadow: none; animation: none; }
  @keyframes tipSpin { to { transform: rotate(360deg); } }
  .tip-spinner {
    width: 15px; height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    animation: tipSpin 0.8s linear infinite;
  }

  /* Share URL box */
  .share-url-box {
    background: rgba(255,243,240,0.7); border: none;
    border-radius: 0.875rem; padding: 12px 16px;
    word-break: break-all; font-size: 13px;
    color: #7b5455; line-height: 1.5;
    font-family: 'Manrope', monospace;
  }

  /* Share buttons */
  .share-btn {
    flex: 1; border-radius: 0.875rem; padding: 0.75rem;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.18s;
  }
  .share-btn:active { transform: scale(0.97); }
  .share-btn:hover { transform: translateY(-1px); }

  /* Ghost btn */
  .vv-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.7);
    color: #7c4343;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    border: 1.5px solid rgba(124,67,67,0.22); border-radius: 9999px;
    padding: 0.35rem 0.9rem;
    cursor: pointer; transition: all 0.15s;
    text-decoration: none;
  }
  .vv-btn-ghost:hover { background: #ffd9d8; border-color: #7c4343; transform: translateY(-1px); }

  /* Thank-you pop */
  @keyframes thankYouPop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  .thank-you-pop { animation: thankYouPop 0.4s ease forwards; }

  /* Layout container & split-screen grid */
  .payment-shell {
    max-width: 1040px;
    margin: 0 auto;
    padding: 1.25rem 1rem 3.5rem;
  }

  .payment-split-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    align-items: start;
    justify-content: center;
  }

  @media (min-width: 920px) {
    .payment-split-grid {
      grid-template-columns: minmax(360px, 440px) minmax(380px, 460px);
      gap: 2.25rem;
    }
  }

  .payment-preview-col {
    display: block;
    width: 100%;
  }

  @media (max-width: 919px) {
    .payment-preview-col {
      display: none;
    }
    .payment-preview-col.mobile-expanded {
      display: block;
      margin-bottom: 1.25rem;
    }
    .mobile-preview-btn-wrap {
      display: block;
    }
  }

  @media (min-width: 920px) {
    .mobile-preview-btn-wrap {
      display: none;
    }
  }

  .payment-checkout-col {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
  }

  @media (min-width: 920px) {
    .payment-checkout-col {
      max-width: 100%;
    }
  }

  /* Live Preview Panel Card */
  .preview-panel-card {
    background: rgba(255, 255, 255, 0.84);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1.5px solid rgba(255, 255, 255, 0.95);
    border-radius: 1.75rem;
    padding: 1.25rem;
    box-shadow: 0 16px 40px rgba(166, 93, 93, 0.12), 0 2px 10px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  @media (min-width: 920px) {
    .preview-panel-card {
      position: sticky;
      top: 86px;
    }
  }

  .preview-badge-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 0.9rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px dashed rgba(200, 130, 140, 0.25);
  }

  .preview-live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7c3f4f;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    position: relative;
  }

  .live-dot::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.45);
    animation: livePulse 2s ease-in-out infinite;
  }

  @keyframes livePulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.7); opacity: 0; }
  }

  /* Bouquet Canvas Wrap */
  .vb-canvas-wrap {
    border-radius: 1.5rem;
    overflow: hidden;
    background: rgba(255, 248, 242, 0.94);
    position: relative;
    box-shadow: 0 14px 36px rgba(166, 93, 93, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.9);
    width: 100%;
    max-width: 370px;
    margin: 0 auto;
    z-index: 1;
  }

  .vb-canvas-wrap .canvas-container,
  .vb-canvas-wrap .lower-canvas,
  .vb-canvas-wrap .upper-canvas {
    position: relative !important;
    z-index: 1 !important;
    max-width: 100% !important;
  }

  .vb-canvas-wrap::before {
    content: '✨'; top: 8px; left: 10px;
    position: absolute; pointer-events: none; z-index: 2;
    font-size: 1.1rem;
    animation: floatSparkle 2.5s ease-in-out infinite;
  }
  .vb-canvas-wrap::after {
    content: '💕'; bottom: 8px; right: 10px;
    position: absolute; pointer-events: none; z-index: 2;
    font-size: 1.1rem;
    animation: floatSparkle 3s ease-in-out infinite 0.5s;
  }

  @keyframes floatSparkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 0.9; transform: scale(1.15); }
  }

  /* Interactive Gift Tag on Canvas */
  @keyframes tagBob {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50%      { transform: translateY(-5px) rotate(1deg); }
  }
  @keyframes tagGlow {
    0%, 100% { box-shadow: 0 4px 14px rgba(228, 141, 156, 0.35); }
    50%      { box-shadow: 0 8px 24px rgba(228, 141, 156, 0.65); }
  }

  .vb-interactive-tag {
    position: absolute;
    bottom: 14px;
    right: 14px;
    z-index: 15;
    background: linear-gradient(135deg, #ffffff 0%, #fff2f5 100%);
    border: 1.5px solid rgba(228, 141, 156, 0.55);
    border-radius: 9999px;
    padding: 0.45rem 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    animation: tagBob 4s ease-in-out infinite, tagGlow 3s ease-in-out infinite;
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 6px 18px rgba(166, 93, 93, 0.16);
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }
  .vb-interactive-tag:hover {
    transform: scale(1.06) rotate(0deg);
  }
  .vb-tag-emoji { font-size: 1.05rem; line-height: 1; }
  .vb-tag-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.76rem;
    font-weight: 800;
    color: #7c3f4f;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .vb-tag-sparkle { font-size: 0.82rem; color: #f59e0b; }

  /* Redesigned, High-End Preview Button */
  .preview-btn-premium {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 0.85rem 1.4rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, #ffffff 0%, #fff2f5 100%);
    border: 1.5px solid rgba(166, 93, 93, 0.35);
    box-shadow: 0 4px 18px rgba(166, 93, 93, 0.10), inset 0 1px 0 #ffffff;
    color: #7c3f4f;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.86rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    box-sizing: border-box;
  }
  .preview-btn-premium:hover {
    background: linear-gradient(135deg, #ffffff 0%, #ffe9ee 100%);
    border-color: #a65d5d;
    box-shadow: 0 8px 24px rgba(124, 63, 79, 0.20), inset 0 1px 0 #ffffff;
    transform: translateY(-2px);
    color: #5c2331;
  }
  .preview-btn-premium:active {
    transform: translateY(0) scale(0.98);
  }
  .preview-btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd9d8, #ffcad4);
    font-size: 0.88rem;
    box-shadow: 0 2px 6px rgba(166, 93, 93, 0.18);
  }
  .preview-btn-arrow {
    font-size: 1.05rem;
    transition: transform 0.2s ease;
  }
  .preview-btn-premium:hover .preview-btn-arrow {
    transform: translateX(4px);
  }

  /* Sender attribution styling */
  .vb-sender-line { font-size: 0.82rem; color: #6b5e5f; }
  .vb-sender-name {
    font-weight: 700; color: #a65d5d;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic; font-size: 1.08rem;
  }

  /* Envelope / Card Reveal Modal (Spring Unfold) */
  .vb-card-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 250;
    background: rgba(38, 24, 27, 0.48);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    animation: fadeInBackdrop 0.25s ease both;
  }
  @keyframes fadeInBackdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .vb-unfolded-card {
    width: 100%;
    max-width: 400px;
    background: linear-gradient(180deg, #ffffff 0%, #fffdfa 55%, #fff7f4 100%);
    border: 1.5px solid rgba(228, 141, 156, 0.45);
    border-radius: 1.75rem;
    padding: 1.6rem 1.4rem 1.4rem;
    box-shadow: 0 24px 60px rgba(124, 63, 79, 0.28), 0 4px 16px rgba(0,0,0,0.06);
    position: relative;
    box-sizing: border-box;
    animation: unfoldCard 0.35s cubic-bezier(0.34, 1.25, 0.64, 1) both;
    transform-origin: bottom center;
  }
  @keyframes unfoldCard {
    from { opacity: 0; transform: translateY(40px) scale(0.9) rotate(-1.5deg); }
    to   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
  }

  .vb-card-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.1rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px dashed rgba(228, 141, 156, 0.35);
  }
  .vb-card-seal-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vb-card-seal {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #ffd9d8 0%, #ffcad4 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    box-shadow: 0 3px 8px rgba(166, 93, 93, 0.15);
  }
  .vb-card-seal-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.74rem;
    font-weight: 800;
    color: #7c3f4f;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .vb-card-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(200, 130, 140, 0.12);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #7c3f4f;
    font-size: 0.95rem;
    transition: background 0.15s, transform 0.15s;
    outline: none;
  }
  .vb-card-close-btn:hover {
    background: rgba(200, 130, 140, 0.25);
    transform: scale(1.08);
  }

  .vb-card-body-scroll {
    max-height: min(52vh, 380px);
    overflow-y: auto;
    padding: 0.25rem 0.5rem;
    margin: 0 -0.25rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(200, 130, 140, 0.35) transparent;
  }
  .vb-card-note-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    line-height: 1.75;
    color: #382425;
    font-style: italic;
    word-break: break-word;
    white-space: pre-wrap;
    text-align: center;
    margin: 0;
  }

  .vb-card-signature {
    margin-top: 1.15rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(228, 141, 156, 0.25);
    text-align: center;
  }

  .vb-card-return-btn {
    width: 100%;
    margin-top: 0.85rem;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    padding: 0.7rem 1.25rem;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(124, 63, 79, 0.25);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .vb-card-return-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 26px rgba(124, 63, 79, 0.35);
  }
`;

/* -- MAIN COMPONENT -- */
export default function Payment() {
  const location = useLocation();
  const { t } = useTranslation();

  const pendingCheckout = useMemo(() => getPending(), []);
  const checkoutDraft = useMemo(() => loadCheckoutDraft(), []);
  const stems = location.state?.stems ?? pendingCheckout?.stems ?? checkoutDraft?.stems ?? [];
  const note = location.state?.note ?? pendingCheckout?.note ?? checkoutDraft?.note ?? "";
  const initName = location.state?.senderName ?? pendingCheckout?.senderName ?? checkoutDraft?.senderName ?? "";
  const musicTrack = location.state?.musicTrack ?? pendingCheckout?.musicTrack ?? checkoutDraft?.musicTrack ?? "none";
  const voiceNote = location.state?.voiceNote ?? pendingCheckout?.voiceNote ?? checkoutDraft?.voiceNote ?? null;

  const hasBouquetData = stems.length > 0 || countWords(note) > 0;
  const flowerCount = stems.length;
  const wordCount = countWords(note);

  const [senderName] = useState(initName);
  const [shareUrl, setShareUrl] = useState(location.state?.shareUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  /* -- Stable preview ID: generated once, reused for the real share URL after payment -- */
  const previewId = useMemo(() => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`, []);

  /* Tip jar state */
  const [countryCode, setCountryCode] = useState(() => getLikelyCountryFromClient());
  const [isDetectingCountry, setIsDetectingCountry] = useState(true);
  const [selectedTip, setSelectedTip] = useState(1); // index into presets
  const [isTipping, setIsTipping] = useState(false);
  const [tipDone, setTipDone] = useState(false);
  const [tipMsg, setTipMsg] = useState("");

  const razorpayKeyId =
    typeof process !== "undefined" && process.env
      ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID
      : undefined;
  const isIndia = countryCode === "IN";
  const isPhilippines = false;
  const currentTip = isIndia ? TIP_PRESET_INR : TIP_PRESET_USD;

  /* -- Detect country -- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsDetectingCountry(true);
      try {
        const res = await fetch(apiUrl("/api/geo"));
        const data = await readApi(res);
        const c = String(data?.country || "").toUpperCase();
        if (!cancelled) setCountryCode(c || getLikelyCountryFromClient());
      } catch {
        if (!cancelled) setCountryCode(getLikelyCountryFromClient());
      } finally {
        if (!cancelled) setIsDetectingCountry(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* -- SEO -- */
  useEffect(() => {
    applySeo({
      title: "Your Bouquet is Ready! | Petals and Words",
      description: "Your digital bouquet is ready to share. Copy the link and send it!",
      keywords: seoKeywords.payment,
      path: "/payment",
      robots: "noindex,nofollow",
    });
  }, []);

  /* -- Write preview payload to localStorage as soon as bouquet data is available -- */
  useEffect(() => {
    if (!hasBouquetData) return;
    const previewPayload = {
      stems,
      note,
      senderName: senderName.trim(),
      musicTrack,
      voiceNote,
      plan: "preview",
      isPreview: true,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`bouquet_share_${previewId}`, JSON.stringify(previewPayload));
    } catch { /* localStorage full */ }

    // Cleanup: remove the preview entry when user leaves without paying
    return () => {
      // Only remove if payment hasn't happened (shareUrl stays empty)
      // We use a ref-like trick: read directly from storage
      try {
        const stored = localStorage.getItem(`bouquet_share_${previewId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.isPreview) localStorage.removeItem(`bouquet_share_${previewId}`);
        }
      } catch { /* ignore */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewId, hasBouquetData, musicTrack, voiceNote]);

  /* -- Save bouquet & generate permanent link after payment (reuses previewId) -- */
  const generateShareLink = useCallback(async (provider = "") => {
    if (!hasBouquetData || shareUrl) return false;
    setIsSaving(true);

    // Upgrade the preview entry to a paid entry using the same ID
    // so the URL the user already previewed becomes the real share link
    const payload = {
      stems,
      note,
      senderName: senderName.trim(),
      musicTrack,
      voiceNote,
      plan: "paid",
      isPreview: false,
      createdAt: new Date().toISOString(),
    };

    // Firebase save is best-effort (non-blocking)
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, "bouquets", previewId), payload).catch((err) => {
        console.warn("Firebase save failed (non-fatal):", err.message);
      });
    }

    // Upgrade localStorage entry from preview → paid
    try {
      localStorage.setItem(`bouquet_share_${previewId}`, JSON.stringify(payload));
      localStorage.removeItem(PENDING_KEY);
      clearCheckoutDraft();
    } catch {
      // localStorage full edge case
    }

    const url = `${window.location.origin}/view/${previewId}`;
    setShareUrl(url);
    setIsSaving(false);
    trackEv("bouquet_shared_paid", { flowerCount, wordCount, provider });
    return true;
  }, [flowerCount, hasBouquetData, note, previewId, senderName, shareUrl, stems, wordCount]);

  /* -- Copy link -- */
  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { setStatusMsg("Copy failed — try selecting the text manually."); }
  };

  /* -- Razorpay tip -- */
  const startRazorpayTip = async () => {
    if (isTipping) return;
    if (!razorpayKeyId) {
      setTipMsg("Payment setup is incomplete. Razorpay key is missing.");
      return;
    }
    setTipMsg("");
    setIsTipping(true);

    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Check ad-blocker/network and try again.");
      }

      const currency = isIndia ? "INR" : "USD";
      const amountMinor = Math.round(currentTip.amount * 100);
      const itemDescription = flowerCount > 0
        ? `Digital Bouquet (${flowerCount} stems${voiceNote ? ", Voice Memo" : ""}${musicTrack && musicTrack !== "none" ? `, Music` : ""})`
        : "Digital Bouquet & Handwritten Letter";

      trackEv("tip_attempt", { provider: "razorpay", amount: currentTip.amount, currency });

      const orderRes = await fetch(apiUrl("/api/razorpay/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "digital_bouquet",
          amountMinor,
          currency,
          receipt: `rcpt_bq_${previewId.slice(0, 14)}`,
          notes: {
            gift_type: "Digital Flower Bouquet",
            stems_count: `${flowerCount} stems`,
            has_voice_memo: voiceNote ? "Yes (30s Audio Memo)" : "No",
            soundtrack: musicTrack && musicTrack !== "none" ? String(musicTrack) : "None",
            sender_name: senderName ? String(senderName).trim() : "Anonymous",
            letter_words: `${wordCount} words`,
            gift_id: String(previewId),
            website: "www.petalsandwords.com",
          },
        }),
      });
      const orderData = await readApi(orderRes);
      if (!orderRes.ok || !orderData?.orderId) {
        if (orderRes.status === 404) {
          throw new Error(
            "Payment API endpoint not found (HTTP 404). Deploy backend API routes or set VITE_API_BASE_URL to your API host."
          );
        }
        const detail = orderData?.error || `HTTP ${orderRes.status}`;
        throw new Error(`Unable to create payment order (${detail}).`);
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        order_id: orderData.orderId,
        currency: orderData.currency || currency,
        name: "Petals and Words",
        description: itemDescription,
        image: "https://www.petalsandwords.com/logo-transparent.png",
        prefill: {
          name: senderName ? String(senderName).trim() : "",
        },
        notes: {
          gift_type: "Digital Flower Bouquet",
          stems_count: `${flowerCount} stems`,
          has_voice_memo: voiceNote ? "Yes" : "No",
          sender: senderName ? String(senderName).trim() : "Anonymous",
          gift_id: String(previewId),
        },
        theme: { color: "#7b5455" },
        modal: {
          ondismiss: () => {
            setIsTipping(false);
            setTipMsg("Payment cancelled. Complete payment to unlock your share link.");
            trackEv("tip_cancelled", { provider: "razorpay" });
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(apiUrl("/api/razorpay/verify"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await readApi(verifyRes);
            if (!verifyRes.ok || !verifyData?.ok) throw new Error("Verification failed");
            setTipDone(true);
            setTipMsg("");
            try {
              localStorage.setItem("pw_has_paid", "true");
              window.dispatchEvent(new CustomEvent("pw-payment-success"));
            } catch (e) {}
            trackEv("tip_success", { provider: "razorpay", amount: currentTip.amount });
          } catch {
            setTipDone(true);
            setTipMsg("Thank you! Your payment was received.");
            try {
              localStorage.setItem("pw_has_paid", "true");
              window.dispatchEvent(new CustomEvent("pw-payment-success"));
            } catch (e) {}
            trackEv("tip_success", { provider: "razorpay", amount: currentTip.amount });
          }
          generateShareLink().then(() => setIsTipping(false));
        },
      });

      razorpay.on("payment.failed", () => {
        setIsTipping(false);
        setTipMsg("Payment didn't go through. Please try again to get your share link.");
        trackEv("tip_failed", { provider: "razorpay" });
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setTipMsg(err?.message || "Couldn't start payment. Please try again.");
      setIsTipping(false);
    }
  };

  /* -- No bouquet data -- */
  if (!hasBouquetData) {
    return (
      <main className="tip-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <div className="vv-card" style={{ maxWidth: 380, padding: "2rem 1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💐</p>
          <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.4rem", fontWeight: 400, marginBottom: "0.5rem" }}>
            {t("payment.noBouquetFound")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#6b5e5f", marginBottom: "1.25rem" }}>
            {t("payment.createFirst")}
          </p>
          <Link to="/create" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "linear-gradient(135deg, #7b5455, #ffd9d8 160%)",
            color: "#fff", fontFamily: "'Manrope', sans-serif", fontWeight: 700,
            fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase",
            borderRadius: "9999px", padding: "0.75rem 1.75rem", textDecoration: "none",
            boxShadow: "0 12px 36px rgba(123,84,85,0.22)",
          }}>
            {t("payment.createBouquet")}
          </Link>
        </div>
      </main>
    );
  }

  /* -- Saving state -- */
  if (isSaving) {
    return (
      <main className="tip-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <style>{CSS}</style>
        <div className="vv-card" style={{ maxWidth: 380, padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, margin: "0 auto 1rem", border: "3px solid #f5f3ef", borderTop: "3px solid #7b5455", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.15rem", fontWeight: 400, color: "#3E2723" }}>
            {t("payment.creatingLink")}
          </p>
          <p style={{ fontSize: "0.8rem", color: "#9e8f90", marginTop: "0.5rem" }}>{t("payment.justAMoment")}</p>
        </div>
      </main>
    );
  }

  /* -- Main: success + tip jar -- */
  return (
    <main className="tip-root" style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <style>{CSS}</style>

      {/* Header */}
      <header className="tip-header">
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/logo-transparent.png" alt="Petals and Words" style={{ height: 30, width: "auto" }} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link to="/" className="vv-btn-ghost">{t("common.home")}</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="payment-shell">

        {tipDone ? (
          <>
            {/* -- Success state: 2 columns on desktop so creator can admire bouquet alongside share links -- */}
            <div className="payment-split-grid">
              {/* Left Column: Bouquet preview */}
              {hasBouquetData && (
                <div className="payment-preview-col au au-2">
                  <div className="preview-panel-card">
                    <div className="preview-badge-header">
                      <div className="preview-live-indicator">
                        <span className="live-dot" />
                        <span>{isPhilippines ? "Silip ng Recipient" : "Live Recipient View"}</span>
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#a65d5d", fontWeight: 700, background: "#fff0f3", padding: "0.2rem 0.55rem", borderRadius: "99px", border: "1px solid #ffd9d8" }}>
                        {t("payment.stems", { count: flowerCount })}
                      </span>
                    </div>

                    <div className="vb-canvas-wrap">
                      <RecipientBouquetCanvas stems={stems} />
                      {note?.trim() && (
                        <button
                          type="button"
                          className="vb-interactive-tag"
                          onClick={() => setIsNoteOpen(true)}
                          title={isPhilippines ? "Pindutin para basahin ang sulat" : "Tap to read personal note"}
                        >
                          <span className="vb-tag-emoji">💌</span>
                          <span className="vb-tag-label">{isPhilippines ? "Basahin ang sulat" : "Read note"}</span>
                          <span className="vb-tag-sparkle">✨</span>
                        </button>
                      )}
                    </div>

                    <div style={{ marginTop: "1rem", textAlign: "center" }}>
                      <p className="vb-sender-line">
                        {isPhilippines ? "Ginawa nang may " : "Crafted with "}
                        <span style={{ color: "#e25555", margin: "0 3px" }}>♥</span>
                        {isPhilippines ? " ni " : " by "}
                        <span className="vb-sender-name">{senderName || (isPhilippines ? "isang espesyal na tao" : "someone special")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column: Share link card & congratulations */}
              <div className="payment-checkout-col au au-1">
                {/* Success header */}
                <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                  <div className="check-pop" style={{
                    width: 64, height: 64, borderRadius: "9999px", margin: "0 auto 1rem",
                    background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.75rem",
                    boxShadow: "0 8px 24px rgba(34,197,94,0.2)",
                  }}>
                    ✓
                  </div>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.1rem", fontWeight: 500, lineHeight: 1.2, marginBottom: "0.4rem", color: "#3d3028" }}>
                    {isPhilippines ? (
                      <>Handa na ang iyong <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>bouquet!</em></>
                    ) : (
                      <>{t("payment.liveHeadlinePrefix", "Your bouquet is ")} <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>{t("payment.liveHeadlineSuffix", "live!")}</em></>
                    )}
                  </h1>
                  <p style={{ fontSize: "0.85rem", color: "#705f58" }}>
                    {isPhilippines ? "I-share ang link sa iyong minamahal sa ibaba" : t("payment.liveDesc", "Share your bouquet link below")}
                  </p>
                </div>

                {/* Share link card */}
                <div className="vv-card au au-2" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
                  <p className="vv-label" style={{ marginBottom: "0.6rem" }}>{t("payment.yourShareLink", "Your share link")}</p>
                  <div className="share-url-box" style={{ marginBottom: "0.75rem" }}>{shareUrl}</div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button onClick={copyLink} className="share-btn" style={{
                      background: copied ? "#166534" : "linear-gradient(135deg, #a65d5d, #7c3f4f)",
                      color: "#fff", flex: "1 1 120px", minHeight: "44px",
                    }}>
                      {copied ? (isPhilippines ? "Na-copy na! ✓" : t("common.copied", "Copied")) : (isPhilippines ? "Kopyahin ang Link" : t("common.copyLink", "Copy link"))}
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        isPhilippines ? `May munting bouquet akong ginawa para sa'yo! 🌸 ${shareUrl}` : `Here's a bouquet I made for you ${shareUrl}`
                      )}`}
                      target="_blank" rel="noreferrer"
                      className="share-btn"
                      style={{ background: "#25D366", color: "#fff", textDecoration: "none", flex: "1 1 120px", minHeight: "44px" }}
                    >
                      <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.527 5.845L.057 23.272a.75.75 0 00.914.914l5.427-1.47A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-5.2-1.501l-.373-.221-3.87 1.048 1.048-3.834-.241-.385A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                      </svg>
                      {isPhilippines ? "WhatsApp" : t("payment.whatsapp", "WhatsApp")}
                    </a>
                    {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                      <button
                        onClick={() => {
                          navigator.share({
                            title: "Petals & Words",
                            text: isPhilippines ? "May munting bouquet akong ginawa para sa'yo! 🌸" : "Here's a bouquet I made for you 🌸",
                            url: shareUrl,
                          }).catch(() => {});
                        }}
                        className="share-btn"
                        style={{ background: "linear-gradient(135deg, #0084FF, #00C6FF)", color: "#fff", flex: "1 1 100%", minHeight: "42px" }}
                      >
                        💬 {isPhilippines ? "I-share sa Messenger / Apps" : "Share via Apps"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Thank you state */}
                <div className="vv-card thank-you-pop au au-4" style={{
                  padding: "1.75rem 1.25rem", marginBottom: "1rem", textAlign: "center",
                  background: "linear-gradient(135deg, #fdf4ff, #fce7f3, #fff1f2)",
                }}>
                  <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>💖</span>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", fontWeight: 600, marginBottom: "0.3rem", color: "#7b5455" }}>
                    {isPhilippines ? "Maraming salamat!" : t("payment.thankYouHeadline", "Thank you so much!")}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "#6b5e5f", lineHeight: 1.6 }}>
                    {isPhilippines
                      ? "Napakalaking tulong ng iyong suporta sa amin. Enjoy sa pagpapadala ng pagmamahal gamit ang iyong mga bouquet!"
                      : `${t("payment.supportMeansWorld", "Your support means the world to me.")} ${t("payment.enjoySpreadingLove", "Enjoy spreading love with your bouquets.")}`}
                  </p>
                </div>

                {/* Back to create */}
                <div className="au au-5" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                  <Link to="/create" style={{ fontSize: "0.78rem", color: "#9e8f90", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    {isPhilippines ? "Gumawa ng isa pang bouquet" : t("payment.createAnother", "Create another bouquet")}
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Header Title */}
            <div className="au au-1" style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "9999px", margin: "0 auto 0.75rem",
                background: "linear-gradient(135deg, #fff5f4, #ffd9d8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.65rem",
                boxShadow: "0 8px 24px rgba(123,84,85,0.15)",
              }}>
                💌
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 500, lineHeight: 1.15, marginBottom: "0.35rem", color: "#3d3028" }}>
                {isPhilippines ? (
                  <>Napakaganda ng <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>bouquet mo!</em></>
                ) : (
                  <>Your bouquet is <em className="wd-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>beautiful!</em></>
                )}
              </h1>
              <p style={{ fontSize: "0.88rem", color: "#705f58" }}>
                {isPhilippines ? "Isang hakbang na lang para makuha ang iyong share link" : "One last step to get your shareable link"}
              </p>
            </div>

            {/* Two-column layout on Desktop, stacked on Mobile */}
            <div className="payment-split-grid">

              {/* LEFT COLUMN: Bouquet Live Preview (Visible immediately on large screens without clicking!) */}
              <div className="payment-preview-col au au-2">
                <div className="preview-panel-card">
                  <div className="preview-badge-header">
                    <div className="preview-live-indicator">
                      <span className="live-dot" />
                      <span>{isPhilippines ? "Aktwal na Silip ng Recipient" : "Live Recipient Preview"}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#a65d5d", fontWeight: 700, background: "#fff0f3", padding: "0.2rem 0.55rem", borderRadius: "99px", border: "1px solid #ffd9d8" }}>
                      {t("payment.stems", { count: flowerCount })}
                    </span>
                  </div>

                  {/* Canvas Container */}
                  <div className="vb-canvas-wrap">
                    {hasBouquetData ? (
                      <RecipientBouquetCanvas stems={stems} />
                    ) : (
                      <div style={{ height: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
                        <span style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>💐</span>
                        <p style={{ color: "#7b5455", fontSize: "0.9rem" }}>No bouquet loaded yet</p>
                      </div>
                    )}

                    {/* Interactive gift tag on bouquet */}
                    {note?.trim() && (
                      <button
                        type="button"
                        className="vb-interactive-tag"
                        onClick={() => setIsNoteOpen(true)}
                        title={isPhilippines ? "Pindutin para basahin ang sulat" : "Tap to read personal note"}
                      >
                        <span className="vb-tag-emoji">💌</span>
                        <span className="vb-tag-label">{isPhilippines ? "Basahin ang sulat" : "Read note"}</span>
                        <span className="vb-tag-sparkle">✨</span>
                      </button>
                    )}
                  </div>

                  {/* Details below canvas */}
                  <div style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}>
                    <p className="vb-sender-line" style={{ marginBottom: "0.35rem" }}>
                      {isPhilippines ? "Ginawa nang may " : "Crafted with "}
                      <span style={{ color: "#e25555", margin: "0 3px" }}>♥</span>
                      {isPhilippines ? " ni " : " by "}
                      <span className="vb-sender-name">{senderName || (isPhilippines ? "isang espesyal na tao" : "someone special")}</span>
                    </p>

                    {(voiceNote || (musicTrack && musicTrack !== "none")) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center", marginTop: "0.4rem" }}>
                        {voiceNote && (
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3f4f", background: "#fff5f4", border: "1px solid #ffd9d8", borderRadius: "9999px", padding: "0.2rem 0.6rem" }}>
                            🎙 {isPhilippines ? "May Voice Memo" : "Voice Memo Attached"}
                          </span>
                        )}
                        {musicTrack && musicTrack !== "none" && (
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3f4f", background: "#fff5f4", border: "1px solid #ffd9d8", borderRadius: "9999px", padding: "0.2rem 0.6rem" }}>
                            🎵 {isPhilippines ? "May Soundtrack" : "Soundtrack Included"}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Desktop secondary action: Open in dedicated tab */}
                    {hasBouquetData && (
                      <div style={{ marginTop: "0.9rem" }}>
                        <a
                          href={`/view/${previewId}?preview=1`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => trackEv("preview_opened", { previewId, source: "desktop_preview_panel" })}
                          className="preview-btn-premium"
                          style={{ maxWidth: 280, margin: "0 auto", padding: "0.6rem 1rem", fontSize: "0.8rem" }}
                        >
                          <span className="preview-btn-icon">👁</span>
                          <span>{isPhilippines ? "Buksan sa hiwalay na tab" : "Open in new window"}</span>
                          <span className="preview-btn-arrow">↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Bouquet Summary & Payment Panel */}
              <div className="payment-checkout-col au au-3">
                {/* Bouquet summary card */}
                <div className="vv-card" style={{ padding: "1.1rem 1.25rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div style={{
                      background: "#ffd9d8", borderRadius: "1rem", padding: "0.65rem 0.8rem",
                      display: "flex", flexDirection: "column", alignItems: "center", minWidth: 58,
                    }}>
                      <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>🎁</span>
                      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#7b5455", marginTop: "0.2rem" }}>
                        {t("payment.stems", { count: flowerCount })}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {note?.trim() ? (
                        <>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", color: "#3E2723", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            "{note.trim().slice(0, 90)}{note.trim().length > 90 ? "..." : ""}"
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.25rem" }}>
                            {t("payment.words", { count: wordCount })}
                          </p>
                        </>
                      ) : (
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontStyle: "italic", color: "#9e8f90" }}>
                          {t("payment.noNote")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mandatory payment card */}
                <div className="vv-card au au-4" style={{ padding: "1.6rem 1.4rem", marginBottom: "1rem", textAlign: "center" }}>
                  {/* Celebration icon */}
                  <div style={{ position: "relative", display: "inline-block", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "2.6rem" }}>💐</span>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.55rem", fontWeight: 600, marginBottom: "0.35rem", color: "#3E2723" }}>
                    {isPhilippines ? "Kaunti na lang — gawing totoo" : "Almost there — make it real"}
                  </h2>
                  <p style={{ fontSize: "0.84rem", color: "#6b5e5f", lineHeight: 1.6, marginBottom: "1.25rem", maxWidth: 360, margin: "0 auto 1.25rem" }}>
                    {isPhilippines
                      ? "Ang maliit na suporta ay nagpapanatili sa serbisyong ito at nag-aunlock ng iyong permanenteng share link — handang ipadala sa Messenger o WhatsApp!"
                      : "A small contribution keeps this platform alive and unlocks your permanent share link — ready to send in seconds."}
                  </p>

                  {/* Trust pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.35rem" }}>
                    {(isPhilippines
                      ? ["🔒 Isang beses lang", "⚡ Handa agad ang link", "📵 Walang subscription"]
                      : ["🔒 One-time only", "⚡ Link ready instantly", "📵 No subscription"]
                    ).map(pill => (
                      <span key={pill} style={{
                        fontSize: "0.72rem", fontWeight: 700, color: "#7b5455",
                        background: "#fff5f4", border: "1px solid #ffd9d8",
                        borderRadius: "9999px", padding: "0.3rem 0.8rem",
                        letterSpacing: "0.03em"
                      }}>{pill}</span>
                    ))}
                  </div>

                  {/* Mobile-only: Prominent, redesigned Preview Button */}
                  {hasBouquetData && (
                    <div className="mobile-preview-btn-wrap" style={{ marginBottom: "1.25rem" }}>
                      <a
                        href={`/view/${previewId}?preview=1`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackEv("preview_opened", { previewId, source: "mobile_card" })}
                        className="preview-btn-premium"
                      >
                        <span className="preview-btn-icon">👁</span>
                        <span>{isPhilippines ? "Silipin ang kanilang makikita" : "Preview what they'll see"}</span>
                        <span className="preview-btn-arrow">→</span>
                      </a>
                      <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.45rem" }}>
                        {isPhilippines ? "Magbubukas sa bagong tab — walang bayad ✨" : "Opens in a new tab — no payment needed ✨"}
                      </p>
                    </div>
                  )}

                  {/* Pay button */}
                  {isDetectingCountry ? (
                    <p style={{ fontSize: "0.78rem", color: "#9e8f90" }}>{t("payment.loadingPayment", "Loading payment option...")}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={startRazorpayTip}
                      disabled={isTipping || isSaving}
                      className="tip-cta"
                    >
                      {isTipping ? (
                        <>
                          <span className="tip-spinner" />
                          {isPhilippines ? "Pinoproseso ang pagbabayad..." : t("payment.processingPayment", "Processing payment...")}
                        </>
                      ) : (
                        <>
                          ✨ {isPhilippines ? `Magbayad ng ${currentTip.display} para makuha ang link` : t("payment.payButton", "Pay {{amount}} to get link", { amount: currentTip.display })}
                        </>
                      )}
                    </button>
                  )}

                  {tipMsg && (
                    <p style={{ fontSize: "0.78rem", color: "#7b5455", marginTop: "0.75rem" }}>{tipMsg}</p>
                  )}

                  {!isDetectingCountry && (
                    <div style={{ marginTop: "0.95rem", fontSize: "0.74rem", color: "#9e8f90", lineHeight: 1.6 }}>
                      {isPhilippines
                        ? "Secure checkout · GCash accepted via Razorpay · Walang recurring charges"
                        : isIndia
                        ? "Secure checkout via Razorpay · Card, UPI & wallets · No recurring charges"
                        : "Secure checkout via Razorpay · International cards accepted · Charged in USD · No recurring charges"}
                    </div>
                  )}
                </div>

                {/* Back to create */}
                <div className="au au-5" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                  <Link to="/create" style={{ fontSize: "0.8rem", color: "#9e8f90", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    {isPhilippines ? "Gumawa ng isa pang bouquet" : t("payment.createAnother", "Create another bouquet")}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Status message */}
        {statusMsg && (
          <div style={{
            borderRadius: "0.875rem", background: "#fef2f2", padding: "0.75rem 1rem",
            fontSize: "0.82rem", color: "#991b1b", marginTop: "1rem", textAlign: "center",
          }}>
            {statusMsg}
          </div>
        )}

      </div>

      {/* Envelope / Note Card Reveal Modal (interactive preview of the note) */}
      {isNoteOpen && note?.trim() && (
        <div
          className="vb-card-modal-backdrop"
          onClick={() => setIsNoteOpen(false)}
        >
          <div
            className="vb-unfolded-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vb-card-topbar">
              <div className="vb-card-seal-group">
                <div className="vb-card-seal">💌</div>
                <span className="vb-card-seal-text">
                  {isPhilippines ? "Liham para sa'yo" : "A Note for You"}
                </span>
              </div>
              <button
                type="button"
                className="vb-card-close-btn"
                onClick={() => setIsNoteOpen(false)}
                aria-label="Close note"
              >
                ✕
              </button>
            </div>

            <div className="vb-card-body-scroll">
              <p className="vb-card-note-text">
                "{note}"
              </p>
            </div>

            <div className="vb-card-signature">
              <p className="vb-sender-line" style={{ margin: 0 }}>
                {isPhilippines ? "Ginawa nang may " : t("viewBouquet.craftedWith", "Crafted with ")}
                <span style={{ color: "#e25555", margin: "0 3px" }}>♥</span>
                {isPhilippines ? " ni " : ` ${t("viewBouquet.by", "by")} `}
                <span className="vb-sender-name">{senderName || (isPhilippines ? "isang espesyal na tao" : "someone special")}</span>
              </p>
            </div>

            <button
              type="button"
              className="vb-card-return-btn"
              onClick={() => setIsNoteOpen(false)}
            >
              🌸 {isPhilippines ? "Tingnan ang Bouquet muli" : "Back to Bouquet"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}




