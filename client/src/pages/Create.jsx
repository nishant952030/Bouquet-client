import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { loadRazorpayScript } from "../lib/razorpay";
import CanvasBoard from "../components/CanvasBoard";
import FlowerPicker from "../components/FlowerPicker";
import NoteCard from "../components/NoteCard";
import { bouquetSuggestions, noteSuggestions } from "../data/bouquetSuggestions";
import { flowers } from "../data/flowerCatalog";
import { trackEvent } from "../lib/analytics";

import { applySeo, seoKeywords } from "../lib/seo";
import { loadCheckoutDraft, saveCheckoutDraft, clearCheckoutDraft } from "../lib/checkoutStorage";
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

/* ─── DESIGN SYSTEM: Velvet & Vellum ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .cr-root {
    font-family: 'Manrope', sans-serif;
    background: #fbf9f5;
    color: #3E2723;
    min-height: 100vh;
  }

  /* Header glass */
  .cr-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(251,249,245,0.88);
  }

  /* Progress bar */
  .prog-track { height: 3px; background: #ede8e9; border-radius: 9999px; overflow: hidden; }
  .prog-fill  { height: 100%; background: linear-gradient(90deg, #7b5455, #ecbaba); border-radius: 9999px; transition: width .5s ease; }

  /* Tab bar */
  .cr-tab-on  { background: #3E2723; color: #fbf9f5; border-color: #3E2723; }
  .cr-tab-off { color: #6b5e5f; border-color: transparent; background: transparent; }
  .cr-tab-off:hover { background: #f5f3ef; }

  /* Note suggestion chips */
  .note-chip-on  { border-color: #7b5455 !important; background: #fff5f4 !important; }
  .note-chip-off { border-color: #ede8e9; background: #f5f3ef; }
  .note-chip-off:hover { border-color: #7b5455; }

  /* VV Button */
  .vv-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #7b5455 0%, #ffd9d8 160%);
    color: #fff;
    font-family: 'Manrope', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    border: none; border-radius: 9999px;
    padding: 0 2rem; min-height: 52px; width: 100%;
    cursor: pointer;
    box-shadow: 0 12px 36px rgba(123,84,85,0.22);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .vv-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 44px rgba(123,84,85,0.3);
  }
  .vv-btn-primary:active { transform: scale(0.98); }
  .vv-btn-primary:disabled {
    background: #e4e2de;
    color: #9e8f90;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }

  /* Ghost btn */
  .vv-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: transparent;
    color: #7b5455;
    font-family: 'Manrope', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    border: 1.5px solid rgba(210,195,196,0.5);
    border-radius: 9999px;
    padding: 0.35rem 0.9rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    text-decoration: none;
  }
  .vv-btn-ghost:hover { background: #ffd9d8; border-color: #7b5455; }

  /* VV card with ambient shadow */
  .vv-card {
    background: #ffffff;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(27,28,26,0.06), 0 2px 6px rgba(27,28,26,0.04);
    overflow: hidden;
  }
  .vv-card-low { background: #f5f3ef; border-radius: 1.5rem; }

  /* VV label */
  .vv-label {
    font-family: 'Manrope', sans-serif;
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #7b5455;
  }

  /* Magic compose pill */
  .magic-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: linear-gradient(135deg, #e8f4fd, #dbeafe);
    color: #1d4ed8;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.06em;
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
    font-family: 'Manrope', sans-serif; font-size: 0.72rem; font-weight: 700;
  }

  /* Flower type button */
  .flower-type-btn {
    width: 100%; border-radius: 0.75rem; padding: 0.5rem 0.75rem;
    text-align: left; font-family: 'Manrope', sans-serif;
    font-size: 0.8rem; font-weight: 600;
    border: 1.5px solid transparent; background: #ffffff;
    transition: all 0.15s; cursor: pointer;
  }
  .flower-type-btn.active  { border-color: #7b5455; color: #7b5455; background: #fff5f4; }
  .flower-type-btn.inactive { color: #4f4445; }
  .flower-type-btn.inactive:hover { border-color: #d2c3c4; background: #f5f3ef; }

  /* Flower tile */
  .flower-tile {
    overflow: hidden; border-radius: 0.875rem;
    border: 2px solid transparent;
    background: #ffffff; padding: 0.4rem;
    transition: all 0.15s; cursor: pointer;
  }
  .flower-tile.selected { border-color: #7b5455; box-shadow: 0 0 0 3px rgba(123,84,85,0.15); }
  .flower-tile:not(.selected):hover { border-color: #d2c3c4; }
  .flower-tile:active { transform: scale(0.97); }

  /* Preset card */
  .preset-card {
    border-radius: 1rem; padding: 0.75rem 0.875rem;
    background: #f5f3ef; border: 1.5px solid transparent;
    text-align: left; transition: all 0.15s; cursor: pointer;
    font-family: 'Manrope', sans-serif;
  }
  .preset-card:hover { border-color: #d2c3c4; background: #ffd9d8; }
  .preset-card:active { transform: scale(0.98); }

  /* Shimmer for WD */
  @keyframes shimmerGrad {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .wd-shimmer {
    background: linear-gradient(90deg, #7b5455 0%, #ecbaba 40%, #c8a96e 70%, #7b5455 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerGrad 4s linear infinite;
  }

  /* Ticker */
  @keyframes tickerMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .ticker-inner { animation: tickerMove 24s linear infinite; }

  /* Fade-up animations */
  @keyframes vvFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fs1 { animation: vvFadeUp 0.4s ease forwards; }
  .fs2 { animation: vvFadeUp 0.4s ease 0.08s forwards; opacity:0; }
  .fs3 { animation: vvFadeUp 0.4s ease 0.16s forwards; opacity:0; }
  .fs4 { animation: vvFadeUp 0.4s ease 0.24s forwards; opacity:0; }
  .fs5 { animation: vvFadeUp 0.4s ease 0.32s forwards; opacity:0; }
  .fs6 { animation: vvFadeUp 0.4s ease 0.40s forwards; opacity:0; }

  /* CTA glow pulse */
  @keyframes ctaPulse {
    0%,100% { box-shadow: 0 12px 36px rgba(123,84,85,0.22); }
    50%      { box-shadow: 0 12px 36px rgba(123,84,85,0.4), 0 0 0 8px rgba(123,84,85,0); }
  }
  .cta-glow { animation: ctaPulse 2.4s ease-in-out infinite; }

  /* ─── Coffee Modal ─── */
  @keyframes modalFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .coffee-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(27,28,26,0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: modalFadeIn 0.3s ease forwards;
  }
  .coffee-modal {
    background: #ffffff;
    border-radius: 1.75rem;
    padding: 2rem 1.5rem;
    max-width: 380px; width: 100%;
    position: relative;
    box-shadow: 0 24px 60px rgba(27,28,26,0.15), 0 0 0 1px rgba(27,28,26,0.04);
    animation: modalSlideUp 0.4s cubic-bezier(0.2,0.8,0.2,1) forwards;
    text-align: center;
  }
  .coffee-close {
    position: absolute; top: 12px; right: 14px;
    background: #f5f3ef; border: none; border-radius: 50%;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 1rem; color: #6b5e5f;
    transition: background 0.15s, transform 0.15s;
  }
  .coffee-close:hover { background: #ede8e9; transform: scale(1.1); }
  .coffee-tip-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
    background: #f5f3ef;
    border: 2px solid transparent;
    border-radius: 1rem;
    padding: 0.75rem 0.5rem;
    cursor: pointer;
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s;
    flex: 1;
  }
  .coffee-tip-btn:hover { border-color: #d2c3c4; background: #ffd9d8; }
  .coffee-tip-btn.selected { border-color: #7b5455; background: #fff5f4; }
  .coffee-tip-btn .tip-emoji { font-size: 1.2rem; line-height: 1; }
  .coffee-tip-btn .tip-amount { font-size: 0.88rem; font-weight: 700; color: #3E2723; }
  .coffee-pay-btn {
    width: 100%; min-height: 48px;
    border-radius: 9999px;
    background: linear-gradient(135deg, #7b5455 0%, #ffd9d8 160%);
    color: #ffffff;
    border: none;
    font-family: 'Manrope', sans-serif;
    font-size: 0.85rem; font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.18s ease;
    box-shadow: 0 10px 30px rgba(123,84,85,0.22);
  }
  .coffee-pay-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(123,84,85,0.3);
  }
  .coffee-pay-btn:active:not(:disabled) { transform: scale(0.98); }
  .coffee-pay-btn:disabled { background: #e4e2de; color: #9e8f90; cursor: not-allowed; box-shadow: none; }
  @keyframes coffeeSpin {
    to { transform: rotate(360deg); }
  }
  .coffee-spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(158, 143, 144, 0.4);
    border-radius: 50%;
    border-top-color: #9e8f90;
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
  @keyframes linkPulse {
    0%,100% { opacity: 0.6; }
    50%     { opacity: 1; }
  }
  .link-status-pulse { animation: linkPulse 1.5s ease-in-out infinite; }

  /* Fixed bottom bar */
  .cr-bottom {
    position: fixed; inset: auto 0 0;
    z-index: 40;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(251,249,245,0.92);
    padding: 0.75rem 1rem 1.25rem;
  }
`;

function countWords(t) { const n = t.trim(); return n ? n.split(/\s+/).length : 0; }

export default function Create() {
  const navigate = useNavigate();
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
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const hasTracked = useRef(false);

  /* coffee modal state */
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTip, setSelectedTip] = useState(1);
  const [isTipping, setIsTipping] = useState(false);
  const [tipDone, setTipDone] = useState(false);

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const TIP_PRESETS = [
    { label: "☕", amount: 29, display: "₹29" },
    { label: "☕☕", amount: 49, display: "₹49" },
    { label: "☕☕☕", amount: 99, display: "₹99" },
  ];
  const currentTip = TIP_PRESETS[selectedTip];

  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const hasBouquetContent = flowerCount > 0 || note.trim().length > 0;
  const progress = Math.min(100, (flowerCount > 0 ? 40 : 0) + Math.min(60, wordCount * 4));

  const visibleBouquets = showMoreBouquets ? bouquetSuggestions : bouquetSuggestions.slice(0, 4);
  const visibleNotes = showMoreNotes ? noteSuggestions : noteSuggestions.slice(0, 4);

  const desktopFlowerGroups = useMemo(() => {
    const byType = flowers.reduce((acc, flower) => {
      const key = (flower.type || "Mixed").toLowerCase();
      if (!acc[key]) acc[key] = { id: key, label: flower.type || "Mixed", items: [] };
      acc[key].items.push(flower);
      return acc;
    }, {});
    const preferred = ["rose", "jasmine", "lily", "tulip", "sunflower", "marigold", "mixed"];
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
    if (Array.isArray(draft.stems) && draft.stems.length)
      setPresetRequest({ id: `draft_${Date.now()}`, stems: draft.stems });
  }, []);

  useEffect(() => { saveCheckoutDraft({ stems, note, senderName }); }, [stems, note, senderName]);

  const handleCanvasStateChange = useCallback((nextStems) => {
    if (Array.isArray(nextStems)) setStems(nextStems);
  }, []);

  const applyBouquet = useCallback((s) => {
    const built = s.build();
    if (built.length) setPresetRequest({ id: `${s.id}_${Date.now()}`, stems: built });
  }, []);

  const generateMagicBouquet = useCallback(() => {
    const shuffled = [...flowers].sort(() => 0.5 - Math.random());
    const selectedFlowers = shuffled.slice(0, 2 + Math.floor(Math.random() * 3));
    const newStems = [];
    const numStems = 7 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numStems; i++) {
      const isCenter = i >= numStems - 2;
      const f = selectedFlowers[Math.floor(Math.random() * selectedFlowers.length)];
      let r, theta;
      if (isCenter) { r = Math.random() * 0.05; theta = Math.random() * Math.PI * 2; }
      else { r = 0.08 + Math.random() * 0.14; theta = (i / (numStems - 2)) * Math.PI * 2 + (Math.random() * 0.5 - 0.25); }
      const x = 0.5 + r * Math.cos(theta);
      const y = 0.55 + Math.random() * 0.05 + r * Math.sin(theta);
      newStems.push({
        stemId: `magic_${Date.now()}_${i}`, src: f.src,
        x: Math.max(0.15, Math.min(0.85, x)), y: Math.max(0.2, Math.min(0.85, y)),
        width: (isCenter ? 0.35 : 0.25) * (0.85 + Math.random() * 0.3),
        angle: (Math.random() * 50 - 25), zIndex: i,
      });
    }
    setPresetRequest({ id: `magic_${Date.now()}`, stems: newStems });
  }, []);

  /* ── Save bouquet & generate link (runs in background) ── */
  const saveBouquetInBackground = useCallback(async () => {
    if (isSaving || shareUrl) return;
    setIsSaving(true);
    const id = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      stems,
      note,
      senderName: senderName.trim(),
      plan: "free",
      createdAt: new Date().toISOString(),
    };
    try {
      if (isFirebaseConfigured && db) await setDoc(doc(db, "bouquets", id), payload);
    } catch (err) {
      console.warn("Firebase save failed (non-fatal):", err.message);
    }
    try {
      localStorage.setItem(`bouquet_share_${id}`, JSON.stringify(payload));
      clearCheckoutDraft();
    } catch { /* localStorage full */ }
    const url = `${window.location.origin}/view/${id}`;
    setShareUrl(url);
    setIsSaving(false);
    track("bouquet_shared_free", { flowerCount, wordCount });
    trackEvent("bouquet_shared_free", { flowerCount, wordCount });
  }, [isSaving, shareUrl, stems, note, flowerCount, wordCount]);

  /* ── Razorpay tip from modal ── */
  const startTip = async () => {
    if (isTipping || !razorpayKeyId) return;
    setIsTipping(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) throw new Error("Unable to load Razorpay.");
      track("tip_attempt", { provider: "razorpay", amount: currentTip.amount });
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "tip",
          amountPaise: currentTip.amount * 100,
          receipt: `tip_${Date.now()}`,
          notes: { type: "buy_me_a_coffee", amount: currentTip.amount },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.orderId) throw new Error("Unable to create tip order.");
      
      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        order_id: orderData.orderId,
        name: "Petals and Words",
        description: "Buy me a coffee ☕",
        theme: { color: "#7b5455" },
        modal: { 
          ondismiss: () => { setIsTipping(false); } 
        },
        handler: async (response) => {
          try {
            await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
          } catch { /* still mark done */ }
          setIsTipping(false);
          setTipDone(true);
          track("tip_success", { provider: "razorpay", amount: currentTip.amount });
        },
      });
      razorpay.on("payment.failed", () => { setIsTipping(false); });
      razorpay.open();
    } catch (err) {
      console.error(err);
      setIsTipping(false);
    }
  };

  /* ── Open coffee modal + start saving ── */
  const goToShare = () => {
    if (!hasBouquetContent) return;
    saveCheckoutDraft({ stems, note, senderName });
    track("share_page_open", { flowerCount, wordCount });
    trackEvent("share_page_open", { flowerCount, wordCount });
    setShowCoffeeModal(true);
    saveBouquetInBackground();
  };

  /* ── Proceed to payment/share page ── */
  const proceedToShare = () => {
    setShowCoffeeModal(false);
    navigate("/payment", { state: { flowerCount, stems, note, senderName, shareUrl } });
  };

  return (
    <main className="cr-root" style={{ paddingBottom: "6.5rem", position: "relative", overflowX: "hidden" }}>
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
                  {["Happy Women's Day  March 8", "Send a bouquet she'll treasure", "Today-only special offer",
                    "For Mom  Sister  Best Friend  Her", "Celebrate every woman in your life", "She deserves more than a text"].map((txt, i) => (
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
            <Link to="/" className="vv-btn-ghost">← Home</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "1rem 1.25rem" }}>

        {/* WD Banner */}
        {wdActive && (
          <div className="fs1" style={{ marginBottom: "1rem" }}>
            <div style={{ borderRadius: "1.5rem", overflow: "hidden", background: "linear-gradient(135deg, #3E2723 0%, #7b5455 100%)", padding: "1rem 1.25rem", position: "relative" }}>
              <DoodleWreathLeft className="absolute left-0 top-0 h-full w-10 opacity-35" />
              <DoodleWreathRight className="absolute right-0 top-0 h-full w-10 opacity-35" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", position: "relative" }}>
                <div>
                  <p className="vv-label" style={{ color: "#ecbaba" }}>March 8 · Women's Day</p>
                  <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.2rem", fontWeight: 400, color: "#fbf9f5", lineHeight: 1.3, marginTop: "0.2rem" }}>Happy Women's Day 🌸</p>
                  <p style={{ fontSize: "0.75rem", color: "rgba(251,249,245,0.7)", marginTop: "0.2rem" }}>This offer disappears at midnight</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
                  <p className="vv-label" style={{ color: "#ecbaba" }}>Ends in</p>
                  <MidnightCountdown />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Page heading ── */}
        <div className="fs2" style={{ marginBottom: "1rem", textAlign: "center" }}>
          {wdActive ? (
            <>
              <p className="vv-label" style={{ marginBottom: "0.4rem" }}>Women's Day Bouquet Builder</p>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(1.7rem, 6vw, 2.2rem)", fontWeight: 400, lineHeight: 1.2, margin: 0 }}>
                Build a bouquet <em className="wd-shimmer">she'll treasure forever</em>
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#6b5e5f", lineHeight: 1.6, marginTop: "0.5rem" }}>
                Pick flowers · write her words · share in 60 seconds
              </p>
            </>
          ) : (
            <>
              <p className="vv-label" style={{ marginBottom: "0.4rem" }}>Bouquet Builder</p>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(1.7rem, 6vw, 2.2rem)", fontWeight: 400, lineHeight: 1.2, margin: 0 }}>
                Create something <em style={{ fontStyle: "italic", color: "#7b5455" }}>beautiful</em>
              </h1>
            </>
          )}
          <div style={{ maxWidth: 280, margin: "0.75rem auto 0" }}>
            <div className="prog-track"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        {/* WD occasion chips */}
        {wdActive && (
          <div className="fs3" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "0.25rem" }}>
            {WD_OCCASIONS.map((item) => (
              <button key={item.label} type="button"
                onClick={() => setNote((n) => n || `Happy Women's Day! ${item.emoji}`)}
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.5rem", background: "#ffffff", borderRadius: "0.875rem", border: "1.5px solid #ede8e9", padding: "0.5rem 0.75rem", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#7b5455"; e.currentTarget.style.background = "#ffd9d8"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#ede8e9"; e.currentTarget.style.background = "#ffffff"; }}
              >
                <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{item.emoji}</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#3E2723", lineHeight: 1 }}>{item.label}</p>
                  <p style={{ fontSize: "0.68rem", color: "#9e8f90", lineHeight: 1.3, marginTop: "0.1rem" }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── CANVAS CARD ── */}
        <section className="fs3 vv-card" style={{ marginBottom: "1rem", padding: "1rem", position: "relative" }}>
          {wdActive && (
            <>
              <DoodleBow className="absolute -top-2 left-1/2 h-9 w-20 -translate-x-1/2 opacity-55" />
              <DoodleFlower className="absolute -right-2 -top-2 h-11 w-11 opacity-22 fp2" />
              <DoodleFlower className="absolute -left-2 -top-2 h-11 w-11 opacity-18 fp3" style={{ transform: "scaleX(-1)" }} />
            </>
          )}

          {/* Canvas header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.875rem", paddingTop: wdActive ? "0.5rem" : 0 }}>
            <div>
              <p className="vv-label">{wdActive ? "Her bouquet" : "Your canvas"}</p>
              <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "1rem", fontWeight: 400, color: "#3E2723", lineHeight: 1.3, marginTop: "0.15rem" }}>
                {wdActive ? "Arrange with love" : "Arrange your bouquet"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button type="button" className="magic-btn" onClick={generateMagicBouquet}>✨ Auto Generate</button>
              <span className="count-pill" style={{ background: "#ffd9d8", color: "#7b5455" }}>🌸 {flowerCount}</span>
              <span className="count-pill" style={{ background: "#fef9ec", color: "#b45309" }}>✍️ {wordCount}w</span>
            </div>
          </div>

          {/* Canvas area - desktop or mobile */}
          {isDesktop ? (
            <div style={{ display: "grid", gridTemplateColumns: "156px 1fr 156px", gap: "0.75rem" }}>
              {/* Left: flower types */}
              <aside className="vv-card-low" style={{ padding: "0.75rem" }}>
                <p className="vv-label" style={{ marginBottom: "0.5rem" }}>Flower type</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {desktopFlowerGroups.map((group) => (
                    <button key={group.id} type="button"
                      className={`flower-type-btn ${selectedFlowerType === group.id ? "active" : "inactive"}`}
                      onClick={() => setSelectedFlowerType(group.id)}>
                      {group.label}
                      <span style={{ marginLeft: "4px", fontSize: "0.68rem", fontWeight: 400, color: "#9e8f90" }}>({group.items.length})</span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Center: canvas */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CanvasBoard selectedFlower={selectedFlower} onCanvasStateChange={handleCanvasStateChange} presetRequest={presetRequest} />
              </div>

              {/* Right: flowers for type */}
              <aside className="vv-card-low" style={{ padding: "0.75rem" }}>
                <p className="vv-label" style={{ marginBottom: "0.5rem" }}>Flowers</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", maxHeight: 360, overflowY: "auto" }}>
                  {desktopFlowersForType.map((flower) => (
                    <button key={flower.id} type="button"
                      className={`flower-tile ${selectedFlower === flower.src ? "selected" : ""}`}
                      onClick={() => setSelectedFlower(flower.src)} title={flower.label}>
                      <img src={flower.src} alt={flower.label} style={{ height: 56, width: "100%", objectFit: "contain" }} loading="lazy" />
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CanvasBoard selectedFlower={selectedFlower} onCanvasStateChange={handleCanvasStateChange} presetRequest={presetRequest} />
            </div>
          )}
        </section>

        {/* ── TAB BAR (mobile only) ── */}
        {!isDesktop && (
          <div className="fs4" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", background: "#f5f3ef", borderRadius: "1.25rem", padding: "0.4rem" }}>
              {[
                { id: "flowers", label: "🌸 Flowers", sub: "Pick stems" },
                { id: "note", label: "✍️ Note", sub: "Write message" },
              ].map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`cr-tab-${activeTab === tab.id ? "on" : "off"}`}
                  style={{ flex: 1, borderRadius: "0.875rem", padding: "0.6rem 0.5rem", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.18s" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, lineHeight: 1 }}>{tab.label}</div>
                  <div style={{ fontSize: "0.68rem", marginTop: "0.2rem", opacity: 0.65, lineHeight: 1 }}>{tab.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FLOWERS TAB ── */}
        {activeTab === "flowers" && (
          <div className="fs5" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Mobile flower picker */}
            {!isDesktop && <FlowerPicker onPick={setSelectedFlower} selectedFlower={selectedFlower} />}

            {/* Bouquet presets */}
            <div className="vv-card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <p className="vv-label">{wdActive ? "Women's Day styles" : "Bouquet presets"}</p>
                {bouquetSuggestions.length > 4 && (
                  <button type="button" className="vv-btn-ghost" onClick={() => setShowMoreBouquets(v => !v)}>
                    {showMoreBouquets ? "Less" : "See all"}
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {visibleBouquets.map((s) => (
                  <button key={s.id} type="button" className="preset-card" onClick={() => applyBouquet(s)}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#3E2723", lineHeight: 1.3 }}>{s.title}</p>
                    <p style={{ fontSize: "0.72rem", color: "#6b5e5f", lineHeight: 1.4, marginTop: "0.2rem" }}>{s.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTE TAB ── */}
        {activeTab === "note" && (
          <div className="fs5" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <NoteCard text={note} setText={setNote} />

            <div className="vv-card" style={{ padding: "1rem" }}>
              <label htmlFor="senderNameInput" className="vv-label" style={{ display: "block", marginBottom: "0.4rem" }}>
                Who is it from?
              </label>
              <input
                id="senderNameInput"
                type="text"
                placeholder="Your Name (Optional)"
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

            {/* WD note suggestions */}
            {wdActive && (
              <div className="vv-card" style={{ padding: "1rem" }}>
                <p className="vv-label" style={{ marginBottom: "0.25rem" }}>Women's Day messages</p>
                <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginBottom: "0.75rem" }}>Tap to use · edit freely</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {WD_NOTE_SUGGESTIONS.map((s) => (
                    <button key={s} type="button"
                      className={`w-full text-left px-3 py-3 rounded-xl border transition-all active:scale-[.98] ${note === s ? "note-chip-on" : "note-chip-off"}`}
                      onClick={() => setNote(s)}
                      style={{ fontFamily: "'Noto Serif', serif", fontSize: "0.88rem", color: "#3E2723", lineHeight: 1.65, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Regular note suggestions */}
            {!wdActive && (
              <div className="vv-card" style={{ padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <p className="vv-label">Note ideas</p>
                  {noteSuggestions.length > 4 && (
                    <button type="button" className="vv-btn-ghost" onClick={() => setShowMoreNotes(v => !v)}>
                      {showMoreNotes ? "Less" : "See all"}
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {visibleNotes.map((s) => (
                    <button key={s} type="button"
                      className={note === s ? "note-chip-on" : "note-chip-off"}
                      onClick={() => setNote(s)}
                      style={{ width: "100%", textAlign: "left", padding: "0.65rem 0.875rem", borderRadius: "0.875rem", border: "1.5px solid", fontFamily: "'Noto Serif', serif", fontSize: "0.9rem", color: "#3E2723", lineHeight: 1.6, cursor: "pointer", transition: "all 0.15s" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WD countdown strip */}
        {wdActive && (
          <div className="fs6" style={{ marginTop: "1rem" }}>
            <div style={{ borderRadius: "1.5rem", overflow: "hidden", background: "linear-gradient(135deg, #3E2723, #7b5455)", padding: "1rem 1.25rem" }}>
              <DoodleLeaf className="absolute -right-1 bottom-0 h-14 w-12 rotate-12 opacity-20" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div>
                  <p className="vv-label" style={{ color: "#ecbaba" }}>Offer disappears at midnight</p>
                  <p style={{ fontSize: "0.82rem", color: "#fbf9f5", marginTop: "0.2rem" }}>
                    {/* Pricing removed */}
                  </p>
                </div>
                <MidnightCountdown />
              </div>
            </div>
          </div>
        )}

      </div>{/* /max-w */}

      {/* ── COFFEE MODAL ── */}
      {showCoffeeModal && (
        <div className="coffee-overlay" onClick={(e) => { if (e.target === e.currentTarget) proceedToShare(); }}>
          <div className="coffee-modal">
            <button type="button" className="coffee-close" onClick={proceedToShare} aria-label="Close">
              ✕
            </button>

            {/* Link status indicator */}
            <div style={{ marginBottom: "1rem" }}>
              {isSaving ? (
                <p className="link-status-pulse" style={{ fontSize: "0.75rem", color: "#7b5455", fontWeight: 600 }}>
                  ⏳ Generating your link...
                </p>
              ) : shareUrl ? (
                <p style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>
                  ✅ Your bouquet link is ready!
                </p>
              ) : null}
            </div>

            {!tipDone ? (
              <>
                {/* Coffee cup with steam */}
                <div style={{ position: "relative", display: "inline-block", marginBottom: "0.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "3px", marginBottom: "-4px" }}>
                    <span className="csteam-1" style={{ fontSize: "0.65rem", color: "#d2c3c4" }}>~</span>
                    <span className="csteam-2" style={{ fontSize: "0.65rem", color: "#d2c3c4" }}>~</span>
                    <span className="csteam-3" style={{ fontSize: "0.65rem", color: "#d2c3c4" }}>~</span>
                  </div>
                  <span style={{ fontSize: "2rem" }}>☕</span>
                </div>

                <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.2rem", fontWeight: 400, marginBottom: "0.25rem", color: "#3E2723" }}>
                  Enjoying Petals & Words?
                </h2>
                <p style={{ fontSize: "0.8rem", color: "#6b5e5f", lineHeight: 1.6, marginBottom: "1rem" }}>
                  This tool is 100% free. If you liked it,<br />
                  consider buying me a coffee!
                </p>

                {/* Tip presets */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.875rem" }}>
                  {TIP_PRESETS.map((preset, i) => (
                    <button
                      key={preset.display}
                      type="button"
                      className={`coffee-tip-btn ${selectedTip === i ? "selected" : ""}`}
                      onClick={() => setSelectedTip(i)}
                    >
                      <span className="tip-emoji">{preset.label}</span>
                      <span className="tip-amount">{preset.display}</span>
                    </button>
                  ))}
                </div>

                {/* Pay button */}
                <button
                  type="button"
                  className="coffee-pay-btn"
                  onClick={startTip}
                  disabled={isTipping}
                >
                  {isTipping ? (
                    <>
                      <span className="coffee-spinner" /> Opening payment...
                    </>
                  ) : (
                    `Buy me a coffee · ${currentTip.display}`
                  )}
                </button>

                <p style={{ fontSize: "0.7rem", color: "#c4b5b6", marginTop: "0.75rem" }}>
                  Completely optional — your bouquet is free! 🌸
                </p>

                {/* Skip link */}
                <button
                  type="button"
                  onClick={proceedToShare}
                  style={{
                    marginTop: "0.75rem",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "0.78rem", color: "#9e8f90",
                    textDecoration: "underline", textUnderlineOffset: "3px",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  No thanks, show my link →
                </button>
              </>
            ) : (
              /* Thank you state */
              <>
                <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>💜</span>
                <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.25rem", fontWeight: 400, marginBottom: "0.3rem", color: "#7b5455" }}>
                  Thank you so much!
                </h2>
                <p style={{ fontSize: "0.82rem", color: "#6b5e5f", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Your support means the world 💐
                </p>
                <button
                  type="button"
                  className="coffee-pay-btn"
                  onClick={proceedToShare}
                >
                  Get your share link →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FIXED BOTTOM CTA ── */}
      <div className="cr-bottom">
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          <button
            type="button"
            onClick={goToShare}
            disabled={!hasBouquetContent}
            className={`vv-btn-primary ${hasBouquetContent ? "cta-glow" : ""}`}
          >
            {hasBouquetContent ? (
              <>
                Share Bouquet 🎉
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              "Add flowers or a note to continue"
            )}
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.6rem", fontSize: "0.7rem", color: "#9e8f90", letterSpacing: "0.08em" }}>
            <span>✨ 100% Free</span><span>|</span>
            <span>Instant link</span><span>|</span>
            <span>No login needed</span>
          </div>
        </div>
      </div>

    </main>
  );
}
