/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { track } from "@vercel/analytics";
import CanvasBoard from "../components/CanvasBoard";
import FlowerPicker from "../components/FlowerPicker";
import NoteCard from "../components/NoteCard";
import MusicSelector from "../components/MusicSelector";
import VoiceRecorder from "../components/VoiceRecorder";
import { bouquetSuggestions, noteSuggestions, noteSuggestionsPH, occasionsPH } from "../data/bouquetSuggestions";
import { flowers } from "../data/flowerCatalog";
import { trackEvent } from "../lib/analytics";

import { applySeo, seoKeywords } from "../lib/seo";
import { loadCheckoutDraft, saveCheckoutDraft } from "../lib/checkoutStorage";
import { addGiftCartItem } from "../lib/giftCart";
import {
  DoodleFlower,
  DoodleHeart,
  DoodleStar,
  DoodleSparkle,
  DoodleLeaf,
  DoodleWreathLeft,
  DoodleWreathRight,
  DoodleCurly,
  DoodleBow
} from "../components/Doodles";
import MidnightCountdown from "../components/MidnightCountdown";

/*  WD data  */
const WD_NOTE_SUGGESTIONS = [
  "Happy Women's Day to the strongest woman I know. Thank you for everything you do, silently and selflessly. ",
  "To the woman who taught me what love really looks like  wishing you a day as beautiful as you are.",
  "You carry so much. Today, let someone carry the flowers for you. Happy Women's Day! ",
  "Dear friend, the world is brighter because you're in it. Happy March 8th! ",
  "Mom, every day I'm grateful you're mine. Today the whole world celebrates women like you. ",
  "To my sister  fierce, funny, and my forever person. Happy Women's Day! ",
];
const WD_OCCASIONS = [
  { emoji: "", label: "For Mom", desc: "Warm & full of love" },
  { emoji: "", label: "For Best Friend", desc: "Playful & personal" },
  { emoji: "", label: "For Her", desc: "Romantic & tender" },
  { emoji: "", label: "For Sister", desc: "Bold & heartfelt" },
];

const PH_FLOWER_NAMES = {
  rose: "Rosas",
  tulip: "Tulips",
  sunflower: "Mirasol",
  hydrangea: "Milflores",
  lily: "Liryo",
  jasmine: "Sampaguita",
  marigold: "Amarilyo",
  mixed: "Iba't Ibang Bulaklak",
};

/* ─── DESIGN SYSTEM: Kawaii Bloom (matches landing page) ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .cr-root {
    font-family: 'Manrope', sans-serif;
    background: linear-gradient(160deg, #fdf6f0 0%, #f8edf0 55%, #fdf0f5 100%);
    color: #3E2723;
    min-height: 100vh;
  }

  /* ── Glassmorphism header ── */
  .cr-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    background: rgba(253,246,240,0.88);
    border-bottom: 1px solid rgba(200,130,140,0.10);
    box-shadow: 0 2px 20px rgba(200,100,120,0.06);
  }

  /* Progress bar */
  .prog-track { height: 3px; background: rgba(200,130,140,0.15); border-radius: 9999px; overflow: hidden; }
  .prog-fill  { height: 100%; background: linear-gradient(90deg, #a65d5d, #e48d9c); border-radius: 9999px; transition: width .5s ease; }

  /* Tab bar */
  .cr-tab-on  { background: #3E2723 !important; color: #fbf9f5 !important; border-color: #3E2723 !important; }
  .cr-tab-off { color: #6b5e5f !important; border-color: transparent !important; background: transparent !important; }
  .cr-tab-off:hover { background: rgba(255,255,255,0.6) !important; }

  /* Note suggestion chips */
  .note-chip-on  { border-color: #a65d5d !important; background: #fff5f4 !important; }
  .note-chip-off { border-color: rgba(200,130,140,0.2); background: rgba(255,255,255,0.7); }
  .note-chip-off:hover { border-color: #a65d5d; background: #fff5f4; transform: translateY(-1px); }

  /* Primary CTA button — matches landing page */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .vv-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    border: none; border-radius: 9999px;
    padding: 0 2rem; min-height: 54px; width: 100%;
    cursor: pointer;
    animation: pw-pulse 2.5s infinite;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .vv-btn-primary:hover { transform: translateY(-2px); }
  .vv-btn-primary:active { transform: scale(0.98); }
  .vv-btn-primary:disabled {
    background: #e4e2de; color: #9e8f90;
    box-shadow: none; cursor: not-allowed; transform: none; animation: none;
  }

  /* Ghost btn */
  .vv-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.7);
    color: #7c4343;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    border: 1.5px solid rgba(124,67,67,0.22); border-radius: 9999px;
    padding: 0.35rem 0.9rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.15s;
    text-decoration: none;
  }
  .vv-btn-ghost:hover { background: #ffd9d8; border-color: #7c4343; transform: translateY(-1px); }
  .vv-cart-cta {
    width: 100%; min-height: 44px;
    justify-content: center;
    margin-top: 0.55rem;
    background: rgba(255,255,255,0.85);
  }

  /* Glass card */
  .vv-card {
    background: rgba(255,255,255,0.78);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(200,130,140,0.10), 0 2px 8px rgba(200,100,100,0.06);
    overflow: hidden;
  }
  .vv-card-low { background: rgba(255,243,240,0.6); backdrop-filter: blur(12px); border-radius: 1.5rem; border: 1px solid rgba(255,255,255,0.7); }

  /* Section label */
  .vv-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem; font-weight: 800;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #a65d5d;
  }

  /* Magic compose pill */
  .magic-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: linear-gradient(135deg, #e8f4fd, #dbeafe);
    color: #1d4ed8;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.05em;
    border: none; border-radius: 9999px;
    padding: 0.3rem 0.85rem;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(29,78,216,0.14);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .magic-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(29,78,216,0.22); }
  .magic-btn:active { transform: scale(0.97); }

  /* Count pill */
  .count-pill {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 9999px; padding: 0.25rem 0.65rem;
    font-family: 'Montserrat', sans-serif; font-size: 0.7rem; font-weight: 700;
  }

  /* Flower type button */
  .flower-type-btn {
    width: 100%; border-radius: 0.875rem; padding: 0.5rem 0.75rem;
    text-align: left;
    font-family: 'Manrope', sans-serif;
    font-size: 0.8rem; font-weight: 600;
    border: 1.5px solid transparent; background: rgba(255,255,255,0.85);
    transition: all 0.15s; cursor: pointer;
  }
  .flower-type-btn.active  { border-color: #a65d5d; color: #a65d5d; background: #fff5f4; }
  .flower-type-btn.inactive { color: #4f4445; }
  .flower-type-btn.inactive:hover { border-color: rgba(200,130,140,0.3); background: rgba(255,245,244,0.6); }

  /* Flower tile */
  .flower-tile {
    overflow: hidden; border-radius: 0.875rem;
    border: 2px solid transparent;
    background: rgba(255,255,255,0.85); padding: 0.4rem;
    transition: all 0.15s; cursor: pointer;
  }
  .flower-tile.selected { border-color: #a65d5d; box-shadow: 0 0 0 3px rgba(166,93,93,0.15); }
  .flower-tile:not(.selected):hover { border-color: rgba(200,130,140,0.4); }
  .flower-tile:active { transform: scale(0.97); }

  /* Preset card */
  .preset-card {
    border-radius: 1rem; padding: 0.75rem 0.875rem;
    background: rgba(255,255,255,0.7); border: 1.5px solid rgba(200,130,140,0.15);
    text-align: left; transition: all 0.18s; cursor: pointer;
    font-family: 'Manrope', sans-serif;
  }
  .preset-card:hover { border-color: #a65d5d; background: #fff5f4; transform: translateY(-1px); }
  .preset-card:active { transform: scale(0.98); }

  /* Shimmer heading */
  @keyframes shimmerGrad {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .wd-shimmer {
    background: linear-gradient(90deg, #7c4343 0%, #c8637a 25%, #d4956a 50%, #c8637a 75%, #7c4343 100%);
    background-size: 300% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerGrad 5s linear infinite;
  }

  /* Ticker */
  @keyframes tickerMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .ticker-inner { animation: tickerMove 24s linear infinite; }

  /* Cute bouncy fade-in */
  @keyframes vvFadeUp {
    0%   { opacity: 0; transform: translateY(18px) scale(0.97); }
    70%  { transform: translateY(-3px) scale(1.01); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .fs1 { animation: vvFadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) forwards; }
  .fs2 { animation: vvFadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) 0.08s forwards; opacity:0; }
  .fs3 { animation: vvFadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) 0.16s forwards; opacity:0; }
  .fs4 { animation: vvFadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) 0.24s forwards; opacity:0; }
  .fs5 { animation: vvFadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) 0.32s forwards; opacity:0; }
  .fs6 { animation: vvFadeUp 0.5s cubic-bezier(0.34,1.3,0.64,1) 0.40s forwards; opacity:0; }

  /* Coffee Modal */
  @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .coffee-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(27,28,26,0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: modalFadeIn 0.3s ease forwards;
  }
  .coffee-modal {
    background: linear-gradient(160deg, #fdf6f0, #fdf0f5);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 2rem;
    padding: 2rem 1.5rem;
    max-width: 380px; width: 100%;
    position: relative;
    box-shadow: 0 24px 60px rgba(124,63,79,0.20);
    animation: modalSlideUp 0.4s cubic-bezier(0.2,0.8,0.2,1) forwards;
    text-align: center;
  }
  .coffee-close {
    position: absolute; top: 12px; right: 14px;
    background: rgba(255,255,255,0.8); border: none; border-radius: 50%;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1rem; color: #6b5e5f;
    transition: background 0.15s, transform 0.15s;
  }
  .coffee-close:hover { background: #ffd9d8; transform: scale(1.1); }
  .coffee-tip-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px; background: rgba(255,255,255,0.8);
    border: 2px solid transparent; border-radius: 1rem;
    padding: 0.75rem 0.5rem; cursor: pointer;
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s; flex: 1;
  }
  .coffee-tip-btn:hover { border-color: rgba(200,130,140,0.4); background: #fff5f4; }
  .coffee-tip-btn.selected { border-color: #a65d5d; background: #fff5f4; }
  .coffee-tip-btn .tip-emoji { font-size: 1.2rem; line-height: 1; }
  .coffee-tip-btn .tip-amount { font-size: 0.88rem; font-weight: 700; color: #3E2723; }
  .coffee-pay-btn {
    width: 100%; min-height: 50px;
    border-radius: 9999px;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #fff; border: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.18s ease;
    box-shadow: 0 12px 34px rgba(124,63,79,0.28);
  }
  .coffee-pay-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(124,63,79,0.38); }
  .coffee-pay-btn:active:not(:disabled) { transform: scale(0.98); }
  .coffee-pay-btn:disabled { background: #e4e2de; color: #9e8f90; cursor: not-allowed; box-shadow: none; }
  @keyframes coffeeSpin { to { transform: rotate(360deg); } }
  .coffee-spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.35); border-radius: 50%; border-top-color: #fff;
    animation: coffeeSpin 0.8s linear infinite;
  }
  @keyframes coffeeSteam {
    0%   { opacity: 0; transform: translateY(0) scaleX(1); }
    50%  { opacity: 0.7; transform: translateY(-6px) scaleX(1.1); }
    100% { opacity: 0; transform: translateY(-14px) scaleX(0.8); }
  }
  .csteam-1 { animation: coffeeSteam 2s ease-in-out infinite; }
  .csteam-2 { animation: coffeeSteam 2s ease-in-out infinite 0.3s; }
  .csteam-3 { animation: coffeeSteam 2s ease-in-out infinite 0.6s; }
  @keyframes linkPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
  .link-status-pulse { animation: linkPulse 1.5s ease-in-out infinite; }

  /* Split-Screen Studio Grid */
  .cr-studio-grid {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 2rem;
    align-items: start;
    max-width: 1240px;
    margin: 0 auto;
    padding: 1.25rem 1.5rem 6rem;
  }
  .cr-sticky-canvas {
    position: sticky;
    top: 76px;
    z-index: 20;
  }
  .cr-studio-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-width: 0;
  }
  .cr-studio-step-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 9999px;
    background: #7c3f4f;
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    flex-shrink: 0;
  }
  @media (max-width: 1023px) {
    .cr-studio-grid {
      display: flex;
      flex-direction: column;
      max-width: 680px;
      padding: 1rem 1.25rem 8rem;
    }
    .cr-sticky-canvas {
      position: static;
    }
  }

  /* Fixed bottom bar */
  .cr-bottom {
    position: fixed; inset: auto 0 0;
    z-index: 40;
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    background: rgba(253,246,240,0.95);
    border-top: 1px solid rgba(200,130,140,0.10);
    padding: 0.75rem 1rem 1.25rem;
  }
`;

function countWords(t) { const n = t.trim(); return n ? n.split(/\s+/).length : 0; }

export default function Create() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const wdActive = false;

  /* core state */
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [stems, setStems] = useState([]);
  const [note, setNote] = useState("");
  const [senderName, setSenderName] = useState("");
  const [presetRequest, setPresetRequest] = useState(null);
  const [showMoreBouquets, setShowMoreBouquets] = useState(false);
  const [showMoreNotes, setShowMoreNotes] = useState(false);
  const [activeTab, setActiveTab] = useState("flowers");
  const [musicTrack, setMusicTrack] = useState("none");
  const [voiceNote, setVoiceNote] = useState(null);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const hasTracked = useRef(false);
  const [added, setAdded] = useState(false);

  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const hasBouquetContent = flowerCount > 0 || note.trim().length > 0;
  const progress = Math.min(100, (flowerCount > 0 ? 40 : 0) + Math.min(60, wordCount * 4));

  /* Philippines geo detection */
  const [country, setCountry] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz === "Asia/Manila") return "PH";
      if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "IN";
    } catch {}
    return "OTHER";
  });

  useEffect(() => {
    fetch("https://api.country.is/")
      .then((r) => r.json())
      .then((d) => {
        if (d?.country) setCountry(d.country);
      })
      .catch(() => {});
  }, []);

  const isPH = country === "PH";
  const activeNoteSuggestions = isPH ? noteSuggestionsPH : noteSuggestions;

  const visibleBouquets = showMoreBouquets ? bouquetSuggestions : bouquetSuggestions.slice(0, 4);
  const visibleNotes = showMoreNotes ? activeNoteSuggestions : activeNoteSuggestions.slice(0, 4);

  const desktopFlowerGroups = useMemo(() => {
    const byType = flowers.reduce((acc, flower) => {
      const key = (flower.type || "Mixed").toLowerCase();
      if (!acc[key]) acc[key] = { id: key, label: flower.type || "Mixed", items: [] };
      acc[key].items.push(flower);
      return acc;
    }, {});
    const preferred = ["peony", "sakura", "rose", "daisy", "baby's breath", "sampaguita", "lavender", "sunflower", "tulip", "hydrangea", "mixed"];
    return Object.values(byType).sort((a, b) => {
      const ai = preferred.indexOf(a.id), bi = preferred.indexOf(b.id);
      const av = ai === -1 ? 999 : ai, bv = bi === -1 ? 999 : bi;
      if (av !== bv) return av - bv;
      return a.label.localeCompare(b.label);
    });
  }, []);

  const [selectedFlowerType, setSelectedFlowerType] = useState("");
  const desktopFlowersForType = useMemo(
    () => desktopFlowerGroups.find((g) => g.id === selectedFlowerType)?.items ?? desktopFlowerGroups[0]?.items ?? [],
    [desktopFlowerGroups, selectedFlowerType],
  );

  useEffect(() => {
    if (!desktopFlowerGroups.length) return;
    const exists = desktopFlowerGroups.some((g) => g.id === selectedFlowerType);
    if (!exists) setSelectedFlowerType(desktopFlowerGroups[0].id);
  }, [desktopFlowerGroups, selectedFlowerType]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    if (media.addEventListener) { media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }
    media.addListener(sync); return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    if (isDesktop && activeTab === "flowers") setActiveTab("note");
  }, [activeTab, isDesktop]);

  useEffect(() => {
    applySeo({
      title: "Create Free Digital Bouquet Online | Add Flowers & Personal Note",
      description: "Create a free digital bouquet online. Choose flowers, write a heartfelt note, and share your bouquet link instantly. No signup, 100% free.",
      keywords: seoKeywords.create,
      path: "/create",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Petals and Words Bouquet Builder",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        url: `${window.location.origin}/create`,
      },
    });
    track("create_start", { source: "create_page" });
    trackEvent("create_start", { source: "create_page" });
  }, []);

  useEffect(() => {
    if (hasTracked.current || !hasBouquetContent) return;
    hasTracked.current = true;
    track("create_content_added", { flowerCount, wordCount });
    trackEvent("create_content_added", { flowerCount, wordCount });
  }, [flowerCount, hasBouquetContent, wordCount]);

  useEffect(() => {
    const draft = loadCheckoutDraft();
    if (!draft) return;
    if (draft.note) setNote(draft.note);
    if (draft.senderName) setSenderName(draft.senderName);
    if (draft.musicTrack) setMusicTrack(draft.musicTrack);
    if (draft.voiceNote) setVoiceNote(draft.voiceNote);
    if (Array.isArray(draft.stems) && draft.stems.length)
      setPresetRequest({ id: `draft_${Date.now()}`, stems: draft.stems });
  }, []);

  useEffect(() => { saveCheckoutDraft({ stems, note, senderName, musicTrack, voiceNote }); }, [stems, note, senderName, musicTrack, voiceNote]);

  const handleCanvasStateChange = useCallback((nextStems) => {
    if (Array.isArray(nextStems)) setStems(nextStems);
  }, []);

  const applyBouquet = useCallback((s) => {
    const built = s.build();
    if (built.length) setPresetRequest({ id: `${s.id}_${Date.now()}`, stems: built });
  }, []);

  const generateMagicBouquet = useCallback(() => {
    const palettes = [
      {
        hero: ["peony", "rose_peach"],
        accent: ["sakura", "rose_1"],
        filler: ["babys_breath", "sampaguita"],
      },
      {
        hero: ["sunflower_2", "sunflower_1"],
        accent: ["daisy", "rose_peach"],
        filler: ["babys_breath", "sampaguita"],
      },
      {
        hero: ["peony", "rose_1"],
        accent: ["lavender", "tulip_lilac"],
        filler: ["babys_breath", "sakura"],
      },
      {
        hero: ["sampaguita", "peony"],
        accent: ["rose_peach", "daisy"],
        filler: ["babys_breath", "sakura"],
      },
    ];

    const chosenTheme = palettes[Math.floor(Math.random() * palettes.length)];
    const findFlower = (keys) => {
      for (const k of keys) {
        const match = flowers.find((f) => f.id.toLowerCase().includes(k) || (f.type && f.type.toLowerCase().includes(k)));
        if (match) return match.src;
      }
      return flowers[Math.floor(Math.random() * flowers.length)].src;
    };

    const heroSrc = findFlower(chosenTheme.hero);
    const accentSrc1 = findFlower(chosenTheme.accent);
    const accentSrc2 = findFlower([chosenTheme.accent[1] || chosenTheme.accent[0]]);
    const fillerSrc = findFlower(chosenTheme.filler);

    const newStems = [
      // Back layer fillers (fanned wide, generous scale)
      {
        stemId: `magic_${Date.now()}_0`,
        src: fillerSrc,
        x: 0.35 + (Math.random() * 0.04 - 0.02),
        y: 0.44 + (Math.random() * 0.03 - 0.015),
        width: 0.44 + Math.random() * 0.03,
        angle: -19 + (Math.random() * 6 - 3),
        zIndex: 0,
      },
      {
        stemId: `magic_${Date.now()}_1`,
        src: fillerSrc,
        x: 0.65 + (Math.random() * 0.04 - 0.02),
        y: 0.44 + (Math.random() * 0.03 - 0.015),
        width: 0.44 + Math.random() * 0.03,
        angle: 19 + (Math.random() * 6 - 3),
        zIndex: 1,
      },
      // Mid layer accent blooms
      {
        stemId: `magic_${Date.now()}_2`,
        src: accentSrc1,
        x: 0.40 + (Math.random() * 0.03 - 0.015),
        y: 0.51 + (Math.random() * 0.03 - 0.015),
        width: 0.47 + Math.random() * 0.03,
        angle: -9 + (Math.random() * 4 - 2),
        zIndex: 2,
      },
      {
        stemId: `magic_${Date.now()}_3`,
        src: accentSrc2,
        x: 0.60 + (Math.random() * 0.03 - 0.015),
        y: 0.51 + (Math.random() * 0.03 - 0.015),
        width: 0.47 + Math.random() * 0.03,
        angle: 9 + (Math.random() * 4 - 2),
        zIndex: 3,
      },
      // Center top crown
      {
        stemId: `magic_${Date.now()}_4`,
        src: accentSrc1,
        x: 0.50 + (Math.random() * 0.02 - 0.01),
        y: 0.40 + (Math.random() * 0.02 - 0.01),
        width: 0.43 + Math.random() * 0.03,
        angle: (Math.random() * 6 - 3),
        zIndex: 4,
      },
      // Front Hero bloom (grand, lush, perfectly anchors the bouquet)
      {
        stemId: `magic_${Date.now()}_5`,
        src: heroSrc,
        x: 0.50,
        y: 0.59 + (Math.random() * 0.02 - 0.01),
        width: 0.56 + Math.random() * 0.03,
        angle: (Math.random() * 4 - 2),
        zIndex: 5,
      },
    ];

    setPresetRequest({ id: `magic_${Date.now()}`, stems: newStems });
  }, []);

  const clearCanvas = useCallback(() => {
    setPresetRequest({ id: `clear_${Date.now()}`, stems: [] });
    setStems([]);
  }, []);

  /* Mandatory payment gate before link generation */
  const goToShare = () => {
    if (!hasBouquetContent) return;
    saveCheckoutDraft({ stems, note, senderName, musicTrack, voiceNote });
    track("share_page_open", { flowerCount, wordCount });
    trackEvent("share_page_open", { flowerCount, wordCount });
    navigate("/payment", { state: { flowerCount, stems, note, senderName, musicTrack, voiceNote } });
  };

  const addBouquetToCart = () => {
    if (!hasBouquetContent) return;
    saveCheckoutDraft({ stems, note, senderName, musicTrack, voiceNote });
    addGiftCartItem("bouquet", { stems, note, senderName, musicTrack, voiceNote });
    track("gift_cart_add", { type: "bouquet", flowerCount, wordCount });
    trackEvent("gift_cart_add", { type: "bouquet", flowerCount, wordCount });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="cr-root" style={{ paddingBottom: "8.75rem", position: "relative", overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* WD floating bg doodles */}
      {wdActive && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <DoodleFlower className="absolute -top-2 left-1 h-14 w-14 fp2 opacity-[.12]" />
          <DoodleFlower className="absolute top-12 right-2 h-10 w-10 fp3 opacity-[.10]" />
          <DoodleSparkle className="absolute top-24 left-1/4 h-7 w-7 fp1 opacity-[.18]" />
          <DoodleStar className="absolute top-8  right-1/3 h-8 w-8 fp4 opacity-[.14]" />
          <DoodleHeart className="absolute top-1/3 -left-1 h-9 w-9 fp4 opacity-[.10]" />
          <DoodleLeaf className="absolute bottom-40 -right-1 h-10 w-11 fp2 opacity-[.10]" />
          <DoodleHeart className="absolute bottom-20 left-1/3 h-8 w-8 fp3 opacity-[.14]" />
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <header className="cr-header">
        {/* WD ticker */}
        {wdActive && (
          <div className="overflow-hidden py-1.5" style={{ background: "linear-gradient(90deg,#3E2723,#7b5455,#ecbaba,#7b5455,#3E2723)" }}>
            <div className="flex ticker-inner whitespace-nowrap select-none">
              {[0, 1].map((gi) => (
                <span key={gi} className="flex shrink-0 items-center gap-8 px-6 text-[11px] font-medium" style={{ color: "rgba(253,217,216,0.9)" }}>
                  {[
                    t("create.ticker1", "Happy Women's Day  March 8"),
                    t("create.ticker2", "Send a bouquet she'll treasure"),
                    t("create.ticker3", "Today-only special offer"),
                    t("create.ticker4", "For Mom  Sister  Best Friend  Her"),
                    t("create.ticker5", "Celebrate every woman in your life"),
                    t("create.ticker6", "She deserves more than a text"),
                  ].map((txt, i) => (
                    <span key={i} className="flex items-center gap-8">{txt}<span style={{ color: "rgba(255,180,170,0.5)" }}>✿</span></span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/logo-transparent.png" alt="Petals and Words" style={{ height: 30, width: "auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Progress pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#7b5455", letterSpacing: "0.1em" }}>{progress}%</span>
              <div className="prog-track" style={{ width: 56 }}>
                <div className="prog-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <Link to="/" className="vv-btn-ghost">{t("common.home")}</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ── DESKTOP SPLIT-SCREEN STUDIO (1024px+) ── */}
      {isDesktop ? (
        <div className="cr-studio-grid">
          {/* Left Column: Sticky Studio Canvas */}
          <div className="cr-sticky-canvas">
            <section className="vv-card" style={{ padding: "1.25rem", position: "relative", boxShadow: "0 16px 40px rgba(166,93,93,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.85rem" }}>
                <div>
                  <p className="vv-label" style={{ fontSize: "0.68rem" }}>{isPH ? "🌸 IYONG CANVAS" : "🌸 STUDIO CANVAS"}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: "#3d3028", lineHeight: 1.2 }}>
                    {isPH ? "Ayusin ang Bouquet" : "Live Bouquet Canvas"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span className="count-pill" style={{ background: "#ffd9d8", color: "#7b5455" }}>
                    🌸 {flowerCount}{isPH ? " bulaklak" : " stems"}
                  </span>
                  <span className="count-pill" style={{ background: "#fef9ec", color: "#b45309" }}>
                    ✍️ {wordCount}{isPH ? " salita" : "w"}
                  </span>
                </div>
              </div>

              {/* Canvas Area */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.85rem" }}>
                <CanvasBoard selectedFlower={selectedFlower} onCanvasStateChange={handleCanvasStateChange} presetRequest={presetRequest} />
              </div>

              {/* Quick action bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", paddingTop: "0.6rem", borderTop: "1px solid rgba(228, 141, 156, 0.2)" }}>
                <button type="button" className="magic-btn" onClick={generateMagicBouquet} style={{ padding: "0.45rem 1rem", fontSize: "0.78rem" }}>
                  {isPH ? "✨ Kusang Ayusin" : "✨ Magic Compose"}
                </button>
                {flowerCount > 0 && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(200,130,140,0.3)",
                      borderRadius: "9999px",
                      padding: "0.4rem 0.85rem",
                      fontSize: "0.72rem",
                      color: "#9e8f90",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#e11d48"; e.currentTarget.style.borderColor = "#fecdd3"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#9e8f90"; e.currentTarget.style.borderColor = "rgba(200,130,140,0.3)"; }}
                  >
                    {isPH ? "🗑️ I-clear" : "🗑️ Clear Canvas"}
                  </button>
                )}
              </div>

              <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#a65d5d", opacity: 0.8, marginTop: "0.5rem" }}>
                {isPH ? "Pumili ng bulaklak sa kanan para ilagay sa canvas" : "Pick flowers on the right to place on canvas"}
              </p>
            </section>
          </div>

          {/* Right Column: Scrollable Studio Panels */}
          <div className="cr-studio-panel">
            {/* Header */}
            <div>
              <p className="vv-label" style={{ marginBottom: "0.3rem" }}>{isPH ? "🌸 Gumawa ng Digital Bouquet" : t("create.label")}</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.15, margin: 0, color: "#3d3028" }}>
                {isPH ? "Gumawa ng bouquet para sa minamahal." : "Create something beautiful."}
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#705f58", lineHeight: 1.6, marginTop: "0.35rem" }}>
                {isPH ? "Pumili ng bulaklak · maglagay ng note · mag-record ng boses." : "Handpick flowers · write your personal letter · record your voice memo."}
              </p>
            </div>

            {/* Step 1: Flowers & Presets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <FlowerPicker onPick={setSelectedFlower} selectedFlower={selectedFlower} isPH={isPH} />

              <div className="vv-card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>💐</span>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "#3d3028" }}>
                      {isPH ? "Mga Estilo ng Bouquet" : "Florist Presets"}
                    </p>
                  </div>
                  {bouquetSuggestions.length > 4 && (
                    <button type="button" className="vv-btn-ghost" onClick={() => setShowMoreBouquets(v => !v)}>
                      {showMoreBouquets ? (isPH ? "Mas Kaunti" : "Less") : (isPH ? "Tingnan Lahat" : "See all")}
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.65rem" }}>
                  {visibleBouquets.map((s) => (
                    <button key={s.id} type="button" className="preset-card" onClick={() => applyBouquet(s)} style={{ padding: "0.85rem" }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#3E2723", lineHeight: 1.3 }}>{t(`create.presetTitle_${s.id}`, s.title)}</p>
                      <p style={{ fontSize: "0.72rem", color: "#6b5e5f", lineHeight: 1.4, marginTop: "0.25rem" }}>{t(`create.presetDesc_${s.id}`, s.description)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Note & Sender */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {isPH && (
                <div className="vv-card" style={{ padding: "1.1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="vv-label" style={{ fontSize: "0.68rem" }}>🌸 Piliin ang Okasyon</span>
                    <span style={{ fontSize: "0.7rem", color: "#a65d5d", fontWeight: 600 }}>1-tap sweet notes ↓</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.4rem", scrollbarWidth: "none" }}>
                    {occasionsPH.map((occ) => {
                      const isSelected = note === occ.note;
                      return (
                        <button
                          key={occ.label}
                          type="button"
                          onClick={() => setNote(occ.note)}
                          style={{
                            flexShrink: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: isSelected ? "#fff5f4" : "rgba(255,255,255,0.85)",
                            border: `1.5px solid ${isSelected ? "#a65d5d" : "rgba(200,130,140,0.2)"}`,
                            borderRadius: "9999px",
                            padding: "0.45rem 0.95rem",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            fontFamily: "'Montserrat', sans-serif",
                            color: isSelected ? "#7c3f4f" : "#5c4a40",
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                          }}
                        >
                          <span style={{ fontSize: "0.95rem" }}>{occ.emoji}</span>
                          <span>{occ.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="vv-card" style={{ padding: "1.25rem" }}>
                <NoteCard text={note} setText={setNote} isPH={isPH} />
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(228, 141, 156, 0.2)" }}>
                  <label htmlFor="senderNameInput" className="vv-label" style={{ display: "block", marginBottom: "0.4rem" }}>
                    {isPH ? "GALING KANINO?" : t("create.whoIsItFrom")}
                  </label>
                  <input
                    id="senderNameInput"
                    type="text"
                    placeholder={isPH ? "Iyong Pangalan (Halimbawa: Juan, Maria, Carlo)" : t("create.namePlaceholder")}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    style={{
                      width: "100%", padding: "0.75rem 1rem",
                      borderRadius: "0.875rem", border: "1.5px solid #ede8e9",
                      fontFamily: "'Manrope', sans-serif", fontSize: "0.9rem",
                      color: "#3E2723", background: "#fbf9f5",
                      outline: "none", transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#7b5455"}
                    onBlur={(e) => e.target.style.borderColor = "#ede8e9"}
                  />
                </div>
              </div>

              {/* Note suggestions */}
              <div className="vv-card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <p className="vv-label">{isPH ? "MGA SWEET NA IDEYA SA MENSAHE" : t("create.noteIdeas")}</p>
                  {noteSuggestions.length > 4 && (
                    <button type="button" className="vv-btn-ghost" onClick={() => setShowMoreNotes(v => !v)}>
                      {showMoreNotes ? (isPH ? "Mas Kaunti" : t("create.less")) : (isPH ? "Tingnan Lahat" : t("create.seeAll"))}
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {visibleNotes.map((s) => {
                    const translatedNote = t(`create.noteIdea_${s.replace(/\s+/g, '').substring(0, 10)}`, s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className={note === translatedNote ? "note-chip-on" : "note-chip-off"}
                        onClick={() => setNote(translatedNote)}
                        style={{
                          width: "100%", textAlign: "left", padding: "0.65rem 0.875rem",
                          borderRadius: "0.875rem", border: "1.5px solid",
                          fontFamily: "'Noto Serif', serif", fontSize: "0.9rem",
                          color: "#3E2723", lineHeight: 1.6, cursor: "pointer", transition: "all 0.15s"
                        }}
                      >
                        {translatedNote}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Voice Note & Music */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="vv-card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <VoiceRecorder voiceNote={voiceNote} onChange={setVoiceNote} isPH={isPH} />
                  <MusicSelector selectedTrackId={musicTrack} onChange={setMusicTrack} isPH={isPH} />
                </div>
              </div>
            </div>

            {/* Step 4: Ready to Share */}
            <div className="vv-card" style={{ padding: "1.5rem", background: "linear-gradient(135deg, #ffffff 0%, #fff4f6 100%)", border: "1.5px solid rgba(228, 141, 156, 0.45)", boxShadow: "0 12px 36px rgba(166,93,93,0.12)" }}>
              <button
                type="button"
                onClick={goToShare}
                disabled={!hasBouquetContent}
                className={`vv-btn-primary ${hasBouquetContent ? "cta-glow" : ""}`}
                style={{ width: "100%", fontSize: "0.95rem", minHeight: "56px" }}
              >
                {hasBouquetContent ? (
                  <>
                    {isPH ? "💐 I-SHARE NANG MAY PAGMAMAHAL" : "💐 PREVIEW & SHARE BOUQUET"}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  isPH ? "Maglagay ng bulaklak o sulat para magpatuloy" : "Add flowers or a note to continue"
                )}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginTop: "0.85rem", fontSize: "0.72rem", color: "#9e8f90", letterSpacing: "0.06em" }}>
                <span>✨ 100% Free to create</span><span>•</span>
                <span>Instant Share Link</span><span>•</span>
                <span>No signup needed</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── MOBILE STREAMLINED STUDIO (<1024px) ── */
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0.75rem 1rem 6.5rem" }}>
          {/* Mobile Hero Canvas Card */}
          <section className="vv-card" style={{ padding: "0.85rem", marginBottom: "1rem", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", marginBottom: "0.65rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <button type="button" className="magic-btn" onClick={generateMagicBouquet} style={{ padding: "0.35rem 0.75rem", fontSize: "0.72rem" }}>
                  {isPH ? "✨ Auto-Ayos" : "✨ Magic Compose"}
                </button>
                {flowerCount > 0 && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(200,130,140,0.3)",
                      borderRadius: "9999px",
                      padding: "0.3rem 0.65rem",
                      fontSize: "0.68rem",
                      color: "#9e8f90",
                      cursor: "pointer"
                    }}
                  >
                    🗑️ Clear
                  </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span className="count-pill" style={{ background: "#ffd9d8", color: "#7b5455", fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}>
                  🌸 {flowerCount}
                </span>
                <span className="count-pill" style={{ background: "#fef9ec", color: "#b45309", fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}>
                  ✍️ {wordCount}w
                </span>
              </div>
            </div>

            {/* Mobile Canvas Board */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CanvasBoard selectedFlower={selectedFlower} onCanvasStateChange={handleCanvasStateChange} presetRequest={presetRequest} />
            </div>
          </section>

          {/* Mobile Segmented 3-Pill Switcher */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{
              display: "flex",
              gap: "0.35rem",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(228, 141, 156, 0.3)",
              borderRadius: "9999px",
              padding: "0.3rem",
              boxShadow: "0 4px 16px rgba(124, 67, 67, 0.06)"
            }}>
              {[
                { id: "flowers", label: isPH ? "🌸 Bulaklak" : "🌸 Flowers" },
                { id: "note", label: isPH ? "✍️ Mensahe" : "✍️ Letter" },
                { id: "audio", label: isPH ? "🎙️ Boses at Audio" : "🎙️ Voice & Audio" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      borderRadius: "9999px",
                      padding: "0.55rem 0.35rem",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: isActive ? "#ffffff" : "#6b5e5f",
                      background: isActive ? "linear-gradient(135deg, #7c3f4f 0%, #a65d5d 100%)" : "transparent",
                      boxShadow: isActive ? "0 4px 12px rgba(124,63,79,0.25)" : "none",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                      textAlign: "center"
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Panel on Mobile */}
          {activeTab === "flowers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FlowerPicker onPick={setSelectedFlower} selectedFlower={selectedFlower} isPH={isPH} />

              <div className="vv-card" style={{ padding: "1.1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "#3d3028" }}>
                    {isPH ? "Mga Estilo ng Bouquet" : "Florist Presets"}
                  </p>
                  {bouquetSuggestions.length > 4 && (
                    <button type="button" className="vv-btn-ghost" onClick={() => setShowMoreBouquets(v => !v)}>
                      {showMoreBouquets ? (isPH ? "Mas Kaunti" : "Less") : (isPH ? "Tingnan Lahat" : "See all")}
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {visibleBouquets.map((s) => (
                    <button key={s.id} type="button" className="preset-card" onClick={() => applyBouquet(s)} style={{ padding: "0.75rem" }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#3E2723", lineHeight: 1.25 }}>{t(`create.presetTitle_${s.id}`, s.title)}</p>
                      <p style={{ fontSize: "0.68rem", color: "#6b5e5f", lineHeight: 1.35, marginTop: "0.2rem" }}>{t(`create.presetDesc_${s.id}`, s.description)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "note" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {isPH && (
                <div className="vv-card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                    <span className="vv-label" style={{ fontSize: "0.65rem" }}>🌸 Piliin ang Okasyon</span>
                    <span style={{ fontSize: "0.68rem", color: "#a65d5d", fontWeight: 600 }}>1-tap sweet notes ↓</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.3rem", scrollbarWidth: "none" }}>
                    {occasionsPH.map((occ) => {
                      const isSelected = note === occ.note;
                      return (
                        <button
                          key={occ.label}
                          type="button"
                          onClick={() => setNote(occ.note)}
                          style={{
                            flexShrink: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: isSelected ? "#fff5f4" : "rgba(255,255,255,0.85)",
                            border: `1.5px solid ${isSelected ? "#a65d5d" : "rgba(200,130,140,0.2)"}`,
                            borderRadius: "9999px",
                            padding: "0.4rem 0.85rem",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            color: isSelected ? "#7c3f4f" : "#5c4a40",
                            cursor: "pointer"
                          }}
                        >
                          <span>{occ.emoji}</span>
                          <span>{occ.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="vv-card" style={{ padding: "1.1rem" }}>
                <NoteCard text={note} setText={setNote} isPH={isPH} />
                <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(228, 141, 156, 0.2)" }}>
                  <label htmlFor="senderNameInputMobile" className="vv-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                    {isPH ? "GALING KANINO?" : t("create.whoIsItFrom")}
                  </label>
                  <input
                    id="senderNameInputMobile"
                    type="text"
                    placeholder={isPH ? "Iyong Pangalan" : t("create.namePlaceholder")}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    style={{
                      width: "100%", padding: "0.7rem 0.9rem",
                      borderRadius: "0.875rem", border: "1.5px solid #ede8e9",
                      fontFamily: "'Manrope', sans-serif", fontSize: "0.88rem",
                      color: "#3E2723", background: "#fbf9f5", outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Note suggestions */}
              <div className="vv-card" style={{ padding: "1.1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
                  <p className="vv-label">{isPH ? "MGA SWEET NA IDEYA" : t("create.noteIdeas")}</p>
                  {noteSuggestions.length > 4 && (
                    <button type="button" className="vv-btn-ghost" onClick={() => setShowMoreNotes(v => !v)}>
                      {showMoreNotes ? (isPH ? "Mas Kaunti" : t("create.less")) : (isPH ? "Tingnan Lahat" : t("create.seeAll"))}
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {visibleNotes.map((s) => {
                    const translatedNote = t(`create.noteIdea_${s.replace(/\s+/g, '').substring(0, 10)}`, s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className={note === translatedNote ? "note-chip-on" : "note-chip-off"}
                        onClick={() => setNote(translatedNote)}
                        style={{
                          width: "100%", textAlign: "left", padding: "0.6rem 0.8rem",
                          borderRadius: "0.75rem", border: "1.5px solid",
                          fontFamily: "'Noto Serif', serif", fontSize: "0.85rem",
                          color: "#3E2723", lineHeight: 1.5, cursor: "pointer"
                        }}
                      >
                        {translatedNote}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "audio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="vv-card" style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <VoiceRecorder voiceNote={voiceNote} onChange={setVoiceNote} isPH={isPH} />
                <MusicSelector selectedTrackId={musicTrack} onChange={setMusicTrack} isPH={isPH} />
              </div>
            </div>
          )}

          {/* Mobile Fixed Bottom CTA - Single Clean Button */}
          <div className="cr-bottom">
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <button
                type="button"
                onClick={goToShare}
                disabled={!hasBouquetContent}
                className={`vv-btn-primary ${hasBouquetContent ? "cta-glow" : ""}`}
                style={{ width: "100%", margin: 0, padding: "0.9rem 1.25rem", fontSize: "0.95rem", borderRadius: "9999px" }}
              >
                {hasBouquetContent ? (
                  <>
                    {isPH ? "I-SHARE NANG MAY PAGMAMAHAL 💖" : t("create.goToShare")}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  isPH ? "Maglagay ng bulaklak o sulat" : t("create.addContent", "Add flowers or a note to continue")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}


