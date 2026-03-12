import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import CanvasBoard from "../components/CanvasBoard";
import FlowerPicker from "../components/FlowerPicker";
import NoteCard from "../components/NoteCard";
import { bouquetSuggestions, noteSuggestions } from "../data/bouquetSuggestions";
import { trackEvent } from "../lib/analytics";
import { generateNoteWithGrok } from "../lib/grok";
import { formatUsdFromCents, getSmallPlanUsdCents, getUnlimitedPlanUsdCents, isLaunchOfferActive } from "../lib/pricing";
import { applySeo, seoKeywords } from "../lib/seo";
import { loadCheckoutDraft, saveCheckoutDraft } from "../lib/checkoutStorage";

/* 
   WOMEN'S DAY EXPIRY LOGIC
   isWomensDay() returns true while it is still March 8
   (local device time). At midnight the flag flips to false
   and ALL Women's Day UI disappears automatically.
 */
function isWomensDay() {
  const now = new Date();
  return now.getMonth() === 2 && now.getDate() === 8; // month 0-indexed
}
function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/*  SVG Doodles  */
function DoodleFlower({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M40 40C40 40 36 28 40 22C44 28 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 52 36 58 40C52 44 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 44 52 40 58C36 52 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 28 44 22 40C28 36 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 40C40 40 30 30 29 24C35 27 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M40 40C40 40 50 30 56 29C53 35 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M40 40C40 40 50 50 51 56C45 53 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M40 40C40 40 30 50 24 51C27 45 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="4" fill="#f7d6d0" stroke="#c0605a" strokeWidth="1.5" />
    </svg>
  );
}
function DoodleHeart({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 50 46" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M25 42C25 42 4 28 4 15C4 8 9 3 16 4C20 4.5 23 7 25 10C27 7 30 4.5 34 4C41 3 46 8 46 15C46 28 25 42 25 42Z"
        stroke="#c0605a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12C13 12 11 14 11 17" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function DoodleStar({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M20 4L21.8 15.5L33 12L24.5 20L33 28L21.8 24.5L20 36L18.2 24.5L7 28L15.5 20L7 12L18.2 15.5Z"
        stroke="#c8a96e" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function DoodleSparkle({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M15 2L15 28M2 15L28 15" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 6L24 24M24 6L6 24" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function DoodleLeaf({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M25 55C25 55 8 40 10 20C15 8 25 5 25 5C25 5 35 8 40 20C42 40 25 55 25 55Z"
        stroke="#7a9e72" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 55L25 10" stroke="#7a9e72" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M25 38C20 34 14 32 12 28" stroke="#7a9e72" strokeWidth="1" strokeLinecap="round" />
      <path d="M25 38C30 34 36 32 38 28" stroke="#7a9e72" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function DoodleWreathLeft({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 60 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M30 190C28 160 32 130 26 100C22 75 28 50 24 20" stroke="#7a9e72" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 160C18 152 10 148 8 140C16 138 24 144 26 160Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M28 130C36 120 44 118 48 110C40 108 32 116 28 130Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M26 100C16 94 8 88 6 78C14 78 22 86 26 100Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M28 70C36 62 44 56 50 46C42 46 34 56 28 70Z" stroke="#7a9e72" strokeWidth="1.2" />
      <circle cx="24" cy="40" r="5" stroke="#c0605a" strokeWidth="1.5" />
      <path d="M24 35L24 28M29 40L36 40M24 45L24 52M19 40L12 40" stroke="#c0605a" strokeWidth="1" strokeLinecap="round" />
      <circle cx="32" cy="155" r="4" stroke="#e8a9a4" strokeWidth="1.3" />
    </svg>
  );
}
function DoodleWreathRight({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 60 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M30 190C32 160 28 130 34 100C38 75 32 50 36 20" stroke="#7a9e72" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 160C42 152 50 148 52 140C44 138 36 144 34 160Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M32 130C24 120 16 118 12 110C20 108 28 116 32 130Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M34 100C44 94 52 88 54 78C46 78 38 86 34 100Z" stroke="#7a9e72" strokeWidth="1.2" />
      <path d="M32 70C24 62 16 56 10 46C18 46 26 56 32 70Z" stroke="#7a9e72" strokeWidth="1.2" />
      <circle cx="36" cy="40" r="5" stroke="#c0605a" strokeWidth="1.5" />
      <path d="M36 35L36 28M41 40L48 40M36 45L36 52M31 40L24 40" stroke="#c0605a" strokeWidth="1" strokeLinecap="round" />
      <circle cx="28" cy="155" r="4" stroke="#e8a9a4" strokeWidth="1.3" />
    </svg>
  );
}
function DoodleCurly({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M2 12C12 4 22 20 32 12C42 4 52 20 62 12C72 4 82 20 92 12C102 4 112 20 118 12"
        stroke="#f2cfc8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function DoodleBow({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} aria-hidden="true">
      <path d="M40 20C35 14 22 8 12 12C8 16 10 24 16 26C26 30 38 22 40 20Z"
        stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 20C45 14 58 8 68 12C72 16 70 24 64 26C54 30 42 22 40 20Z"
        stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="20" r="3" fill="#f7d6d0" stroke="#c0605a" strokeWidth="1.5" />
      <path d="M40 23L37 34M40 23L43 34" stroke="#c0605a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/*  Countdown  */
function MidnightCountdown() {
  const [ms, setMs] = useState(msUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return (
    <div className="flex items-center gap-1 font-mono">
      {[h, m, s].map((unit, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="flex h-8 min-w-[30px] items-center justify-center rounded-lg bg-white/20 px-1.5 text-[14px] font-bold text-white tabular-nums">
            {unit}
          </span>
          {i < 2 && <span className="text-rose-300 text-[12px]">:</span>}
        </span>
      ))}
    </div>
  );
}

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

/*  CSS  */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

  .cr-root {
    font-family:'Jost',sans-serif;
    background:linear-gradient(160deg,#fdf6f0 0%,#fceef0 50%,#fdf8f0 100%);
    min-height:100vh;
  }

  @keyframes floatUp {
    0%,100% { transform:translateY(0) rotate(0deg); opacity:.55; }
    50%      { transform:translateY(-14px) rotate(6deg); opacity:.85; }
  }
  @keyframes fadeSlide {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmerGrad {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes ctaPulse {
    0%,100% { box-shadow:0 0 0 0 rgba(192,96,90,.4); }
    50%     { box-shadow:0 0 0 9px rgba(192,96,90,0); }
  }
  @keyframes tickerMove {
    0%   { transform:translateX(0); }
    100% { transform:translateX(-50%); }
  }

  .fp1 { animation:floatUp 4s ease-in-out infinite; }
  .fp2 { animation:floatUp 5.5s ease-in-out infinite 1.2s; }
  .fp3 { animation:floatUp 3.8s ease-in-out infinite .6s; }
  .fp4 { animation:floatUp 6s ease-in-out infinite 2s; }

  .fs1 { animation:fadeSlide .5s ease forwards; }
  .fs2 { animation:fadeSlide .5s ease .1s forwards; opacity:0; }
  .fs3 { animation:fadeSlide .5s ease .2s forwards; opacity:0; }
  .fs4 { animation:fadeSlide .5s ease .3s forwards; opacity:0; }
  .fs5 { animation:fadeSlide .5s ease .4s forwards; opacity:0; }
  .fs6 { animation:fadeSlide .5s ease .5s forwards; opacity:0; }

  .wd-headline {
    background:linear-gradient(90deg,#c0605a 0%,#e8a9a4 40%,#c8a96e 70%,#c0605a 100%);
    background-size:200% auto;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shimmerGrad 4s linear infinite;
  }

  .cta-glow { animation:ctaPulse 2.4s ease-in-out infinite; }

  .ticker-inner { animation:tickerMove 24s linear infinite; }

  .prog-track { height:3px; background:#f0e4d8; border-radius:2px; overflow:hidden; }
  .prog-fill  { height:100%; background:linear-gradient(90deg,#c0605a,#c8a96e); border-radius:2px; transition:width .5s ease; }

  .tab-on  { background:#3a3028; color:#faf6f0; }
  .tab-off { color:#7a6e65; }
  .tab-off:hover { background:#f5ede6; }

  .note-chip-on  { border-color:#c0605a !important; background:#fff5f4 !important; }
  .note-chip-off { border-color: #ffe4e0; background:#faf6f0; }
  .note-chip-off:hover { border-color:#c0605a; }
`;

function countWords(t) { const n = t.trim(); return n ? n.split(/\s+/).length : 0; }

/* 
   MAIN
 */
export default function Create() {
  const navigate = useNavigate();

  const wdActive = false;

  /* core state */
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [stems, setStems] = useState([]);
  const [note, setNote] = useState("");
  const [presetRequest, setPresetRequest] = useState(null);
  const [situationText, setSituationText] = useState("");
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [showMoreBouquets, setShowMoreBouquets] = useState(false);
  const [showMoreNotes, setShowMoreNotes] = useState(false);
  const [activeTab, setActiveTab] = useState("flowers");
  const hasTracked = useRef(false);

  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const hasBouquetContent = flowerCount > 0 || note.trim().length > 0;
  const offerActive = isLaunchOfferActive();
  const smallPriceCents = getSmallPlanUsdCents();
  const unlimitedPriceCents = getUnlimitedPlanUsdCents();
  const smallPrice = formatUsdFromCents(smallPriceCents);
  const unlimitedPrice = formatUsdFromCents(unlimitedPriceCents);
  const progress = Math.min(100, (flowerCount > 0 ? 40 : 0) + Math.min(60, wordCount * 4));

  const canAiNote = useMemo(() => situationText.trim().length > 0 && !isGeneratingNote, [situationText, isGeneratingNote]);
  const visibleBouquets = showMoreBouquets ? bouquetSuggestions : bouquetSuggestions.slice(0, 4);
  const visibleNotes = showMoreNotes ? noteSuggestions : noteSuggestions.slice(0, 4);

  useEffect(() => {
    applySeo({
      title: "Create Digital Bouquet Online | Add Flowers and Note",
      description: "Create a digital bouquet online, add your personal note, and continue to secure checkout to share your bouquet link instantly.",
      keywords: seoKeywords.create,
      path: "/create",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Petals and Words Bouquet Builder",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        offers: { "@type": "AggregateOffer", lowPrice: (smallPriceCents / 100).toFixed(2), highPrice: (unlimitedPriceCents / 100).toFixed(2), offerCount: "2", priceCurrency: "USD" },
        url: `${window.location.origin}/create`,
      },
    });
    track("create_start", { source: "create_page" });
    trackEvent("create_start", { source: "create_page" });
  }, [smallPriceCents, unlimitedPriceCents]);

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
    if (Array.isArray(draft.stems) && draft.stems.length)
      setPresetRequest({ id: `draft_${Date.now()}`, stems: draft.stems });
  }, []);

  useEffect(() => { saveCheckoutDraft({ stems, note }); }, [stems, note]);

  const handleCanvasStateChange = useCallback((nextStems) => {
    if (Array.isArray(nextStems)) setStems(nextStems);
  }, []);

  const applyBouquet = (s) => {
    const built = s.build();
    if (built.length) setPresetRequest({ id: `${s.id}_${Date.now()}`, stems: built });
  };

  const generateAiNote = async () => {
    if (!canAiNote) return;
    setGenerationError(""); setIsGeneratingNote(true);
    try {
      const gen = await generateNoteWithGrok({ situation: situationText });
      setNote(gen); setActiveTab("note");
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Could not generate note right now.");
    } finally { setIsGeneratingNote(false); }
  };

  const goToPayment = () => {
    if (!hasBouquetContent) return;
    saveCheckoutDraft({ stems, note });
    track("payment_page_open", { flowerCount, wordCount });
    trackEvent("payment_page_open", { flowerCount, wordCount });
    navigate("/payment", { state: { flowerCount, stems, note } });
  };

  /*  RENDER  */
  return (
    <main className="cr-root pb-32" style={{ position: "relative", overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* floating bg doodles  WD only */}
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

      {/*  STICKY HEADER  */}
      <header className="sticky top-0 z-30 border-b border-rose-100/60 backdrop-blur"
        style={{ background: "rgba(253,246,240,.97)" }}>

        {/* WD scrolling ticker */}
        {wdActive && (
          <div className="overflow-hidden border-b border-rose-200/50 py-1.5"
            style={{ background: "linear-gradient(90deg,#3a3028,#8e3e3a,#c0605a,#8e3e3a,#3a3028)" }}>
            <div className="flex ticker-inner whitespace-nowrap select-none">
              {[0, 1].map((gi) => (
                <span key={gi} className="flex shrink-0 items-center gap-8 px-6 text-[11px] font-medium text-rose-100/90">
                  {[" Happy Women's Day  March 8",
                    " Send a bouquet she'll treasure",
                    " Today-only special offer",
                    " For Mom  Sister  Best Friend  Her",
                    " Celebrate every woman in your life",
                    " She deserves more than a text",
                  ].map((txt, i) => (
                    <span key={i} className="flex items-center gap-8">
                      {txt}<span className="text-rose-400/60"></span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="Petals and Words" className="h-8 w-auto" />
            {wdActive && (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                 Women's Day
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-[11px] text-stone-400">{progress}%</span>
              <div className="prog-track w-16"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
            </div>
            <Link to="/" className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-medium text-rose-700 transition hover:bg-rose-50">
               Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-4">

        {/*  WD banner with countdown  */}
        {wdActive && (
          <div className="fs1 mb-4">
            <div className="relative overflow-hidden rounded-2xl px-4 py-4"
              style={{ background: "linear-gradient(135deg,#3a3028 0%,#8e3e3a 55%,#c0605a 100%)" }}>
              <DoodleWreathLeft className="absolute left-0 top-0 h-full w-10 opacity-35" />
              <DoodleWreathRight className="absolute right-0 top-0 h-full w-10 opacity-35" />
              <DoodleSparkle className="absolute top-2 right-16 h-5 w-5 opacity-40 fp2" />
              <DoodleSparkle className="absolute bottom-2 left-16 h-4 w-4 opacity-30 fp3" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-200">March 8  Women's Day</p>
                  <p className="mt-0.5 text-[1.2rem] font-light leading-tight text-white"
                    style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                    Happy Women's Day 
                  </p>
                  <p className="mt-0.5 text-[11px] text-rose-100/80">This offer disappears at midnight</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-300">Ends in</p>
                  <MidnightCountdown />
                </div>
              </div>
            </div>
          </div>
        )}

        {/*  Page heading  */}
        <div className="fs2 mb-4 text-center">
          {wdActive ? (
            <>
              <div className="mb-1 flex items-center justify-center gap-2">
                <DoodleStar className="h-5 w-5 opacity-65" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-rose-500">Women's Day Bouquet Builder</p>
                <DoodleStar className="h-5 w-5 opacity-65" />
              </div>
              <h1 className="text-[1.95rem] font-light leading-tight text-stone-900"
                style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                Build a bouquet{" "}
                <em className="wd-headline">she'll treasure forever</em>
              </h1>
              <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-stone-500">
                Pick flowers  write her words  share in 60 seconds
              </p>
              <DoodleCurly className="mx-auto mt-3 w-24 opacity-45" />
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-rose-500">Bouquet builder</p>
              <h1 className="mt-1 text-[1.9rem] font-light leading-tight text-stone-800"
                style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                Create something <em>beautiful</em>
              </h1>
              <p className="mt-1.5 text-[13px] text-stone-500">Add flowers  write a note  share instantly</p>
            </>
          )}
          <div className="mx-auto mt-3 max-w-xs">
            <div className="prog-track"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        {/*  WD occasion quick-pick chips  */}
        {wdActive && (
          <div className="fs3 mb-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {WD_OCCASIONS.map((item) => (
              <button key={item.label} type="button"
                onClick={() => setNote((n) => n || `Happy Women's Day! ${item.emoji}`)}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-rose-100 bg-white px-3 py-2 transition hover:border-rose-300 hover:bg-rose-50 active:scale-95">
                <span className="text-xl leading-none">{item.emoji}</span>
                <div className="text-left">
                  <p className="text-[12px] font-semibold text-stone-800 leading-none">{item.label}</p>
                  <p className="text-[10px] text-stone-400 leading-snug">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/*  Canvas card  */}
        <section className="fs3 mb-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-md"
          style={{ position: "relative" }}>
          {wdActive && (
            <>
              <DoodleBow className="absolute -top-2 left-1/2 h-9 w-20 -translate-x-1/2 opacity-55" />
              <DoodleFlower className="absolute -right-2 -top-2 h-11 w-11 opacity-22 fp2" />
              <DoodleFlower className="absolute -left-2 -top-2 h-11 w-11 opacity-18 fp3"
                style={{ transform: "scaleX(-1)" }} />
            </>
          )}
          <div className="mb-3 flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{wdActive ? "" : ""}</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
                  {wdActive ? "Her bouquet" : "Your canvas"}
                </p>
                <p className="text-[15px] font-light text-stone-800 leading-tight"
                  style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                  {wdActive ? "Arrange with love" : "Arrange your bouquet"}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                 {flowerCount}
              </span>
              <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                 {wordCount}w
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <CanvasBoard selectedFlower={selectedFlower} onCanvasStateChange={handleCanvasStateChange} presetRequest={presetRequest} />
          </div>
        </section>

        {/*  Tab bar  */}
        <div className="fs4 mb-4">
          <div className="flex gap-1.5 rounded-2xl border border-stone-100 bg-white p-1.5 shadow-sm">
            {[
              { id: "flowers", label: wdActive ? "Flowers" : "Flowers", sub: wdActive ? "Her bouquet" : "Build bouquet" },
              { id: "note", label: wdActive ? "Her Note" : "Note", sub: "Write message" },
              { id: "ai", label: "AI Write", sub: "Auto-generate" },
            ].map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={["flex-1 rounded-xl px-2 py-2.5 text-center transition-all duration-150 text-[13px] font-semibold",
                  activeTab === tab.id ? "tab-on shadow-md" : "tab-off"].join(" ")}>
                <div className="leading-none">{tab.label}</div>
                <div className={`mt-0.5 text-[10px] leading-none ${activeTab === tab.id ? "text-rose-200" : "text-stone-400"}`}>
                  {tab.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/*  FLOWERS TAB  */}
        {activeTab === "flowers" && (
          <div className="fs5 space-y-4">
            <FlowerPicker onPick={setSelectedFlower} selectedFlower={selectedFlower} />

            <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {wdActive && <DoodleHeart className="h-5 w-6 shrink-0 opacity-70" />}
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">
                    {wdActive ? "Women's Day styles" : "Bouquet presets"}
                  </p>
                </div>
                {bouquetSuggestions.length > 4 && (
                  <button type="button" onClick={() => setShowMoreBouquets(v => !v)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100">
                    {showMoreBouquets ? "Less" : "See all"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {visibleBouquets.map((s) => (
                  <button key={s.id} type="button" onClick={() => applyBouquet(s)}
                    className="rounded-xl border border-rose-100 bg-[#faf6f0] px-3 py-2.5 text-left transition hover:border-rose-300 hover:bg-rose-50 active:scale-[.97]">
                    <p className="text-[13px] font-semibold text-stone-800 leading-tight">{s.title}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500 leading-tight">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/*  NOTE TAB  */}
        {activeTab === "note" && (
          <div className="fs5 space-y-4">
            <NoteCard text={note} setText={setNote} />

            {/* WD note suggestions */}
            {wdActive && (
              <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-md">
                <div className="mb-3 flex items-center gap-2">
                  <DoodleHeart className="h-5 w-6 shrink-0 opacity-70" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Women's Day messages</p>
                    <p className="text-[12px] text-stone-400">Tap to use | edit freely</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {WD_NOTE_SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => setNote(s)}
                      className={["w-full rounded-xl border px-3 py-3 text-left transition-all active:scale-[.98]",
                        note === s ? "note-chip-on border-[#c0605a] bg-[#fff5f4]" : "note-chip-off"].join(" ")}>
                      <p className="text-[14px] italic leading-relaxed text-stone-700"
                        style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                        {s}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Regular note suggestions */}
            {!wdActive && (
              <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600">Note ideas</p>
                  {noteSuggestions.length > 4 && (
                    <button type="button" onClick={() => setShowMoreNotes(v => !v)}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100">
                      {showMoreNotes ? "Less" : "See all"}
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {visibleNotes.map((s) => (
                    <button key={s} type="button" onClick={() => setNote(s)}
                      className={["w-full rounded-xl border px-3 py-2.5 text-left transition active:scale-[.98]",
                        note === s ? "note-chip-on" : "note-chip-off"].join(" ")}
                      style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: "15px", color: "#78350f" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/*  AI TAB  */}
        {activeTab === "ai" && (
          <div className="fs5">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-lg text-white shadow-md"></div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-600">AI Note Writer</p>
                  <p className="text-[15px] font-light text-stone-800 leading-tight"
                    style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                    {wdActive ? "Write a Women's Day note for her" : "Generate your note"}
                  </p>
                </div>
              </div>
              <p className="mb-3 text-[13px] leading-relaxed text-stone-500">
                {wdActive
                  ? "Tell us who she is to you  AI will craft a heartfelt Women's Day message in your voice."
                  : "Describe your situation and AI will write a personal note for your bouquet."}
              </p>
              <textarea rows={4} value={situationText} onChange={(e) => setSituationText(e.target.value)}
                placeholder={wdActive
                  ? "E.g. It's for my mom who raised me alone and never once complained."
                  : "E.g. We had a tough week and I want to apologize and make her smile."}
                className="w-full resize-none rounded-xl border border-sky-100 bg-[#f7fbff] p-3 text-[14px] text-stone-800 outline-none placeholder:text-stone-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition"
              />
              <button type="button" onClick={generateAiNote} disabled={!canAiNote}
                className={["mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold uppercase tracking-[0.12em] transition-all active:scale-[.98]",
                  canAiNote
                    ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-blue-600"
                    : "cursor-not-allowed bg-stone-100 text-stone-400"
                ].join(" ")}>
                {isGeneratingNote
                  ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Writing...</>
                  : <> {wdActive ? "Write Women's Day Note" : "Generate Note"}</>}
              </button>
              {generationError && (
                <p className="mt-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{generationError}</p>
              )}
              {note && (
                <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Note ready </p>
                  <p className="mt-1 text-[14px] italic leading-relaxed text-emerald-900"
                    style={{ fontFamily: '"Cormorant Garamond",serif' }}>
                    "{note.slice(0, 80)}{note.length > 80 ? "" : ""}"
                  </p>
                  <button type="button" onClick={() => setActiveTab("note")}
                    className="mt-1 text-[11px] font-semibold text-emerald-700 underline underline-offset-2">
                    View &amp; edit 
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/*  WD countdown strip  */}
        {wdActive && (
          <div className="fs6 mt-4">
            <div className="relative overflow-hidden rounded-2xl px-4 py-4"
              style={{ background: "linear-gradient(135deg,#3a3028,#8e3e3a)" }}>
              <DoodleLeaf className="absolute -right-1 bottom-0 h-14 w-12 rotate-12 opacity-20" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200">Offer disappears at midnight</p>
                  <p className="mt-0.5 text-[13px] text-white">
                    {offerActive ? `Special price: ${smallPrice}` : `Plans from ${smallPrice} | One-time`}
                  </p>
                </div>
                <MidnightCountdown />
              </div>
            </div>
          </div>
        )}

      </div>{/* /max-w-2xl */}

      {/*  FIXED BOTTOM CTA  */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100/60 backdrop-blur px-4 pb-5 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.07)]"
        style={{ background: "rgba(253,246,240,.97)" }}>
        <div className="mx-auto max-w-2xl">
          {wdActive && hasBouquetContent && (
            <p className="mb-2 text-center text-[11px] font-medium text-rose-600">
               She'll receive this on Women's Day  make it count
            </p>
          )}
          <button type="button" onClick={goToPayment} disabled={!hasBouquetContent}
            className={["flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-[.98]",
              hasBouquetContent
                ? wdActive
                  ? "cta-glow bg-gradient-to-r from-[#3a3028] to-[#8e3e3a] text-[#faf6f0] shadow-lg"
                  : "bg-[#3a3028] text-[#faf6f0] shadow-lg hover:bg-[#8e3e3a]"
                : "cursor-not-allowed bg-stone-200 text-stone-400"
            ].join(" ")}>
            {hasBouquetContent ? (
              <>
                {wdActive ? " Send her bouquet" : "Continue to checkout"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              wdActive ? "Add flowers or a note for her first" : "Add flowers or a note to continue"
            )}
          </button>
          <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-stone-400">
            <span>Secure</span><span>|</span>
            <span>Instant link</span><span>|</span>
            <span>{smallPrice} one-time</span>
            {wdActive && <><span>|</span><span className="font-medium text-rose-500">WD Special</span></>}
          </div>
        </div>
      </div>

    </main>
  );
}
