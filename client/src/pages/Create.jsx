import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import CanvasBoard from "../components/CanvasBoard";
import FlowerPicker from "../components/FlowerPicker";
import NoteCard from "../components/NoteCard";
import { bouquetSuggestions, noteSuggestions } from "../data/bouquetSuggestions";
import { trackEvent } from "../lib/analytics";
import { generateNoteWithGrok } from "../lib/grok";
import { getOfferDateLabel, getSmallPlanPrice, getUnlimitedPlanPrice, isLaunchOfferActive } from "../lib/pricing";
import { applySeo, seoKeywords } from "../lib/seo";
import { loadCheckoutDraft, saveCheckoutDraft } from "../lib/checkoutStorage";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  .create-root {
    font-family: 'Jost', sans-serif;
    background: #faf6f0;
    min-height: 100vh;
  }

  /* Scrollbar hide for flower picker */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Section fade-in */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-in { animation: fadeSlideUp 0.4s ease forwards; }
  .anim-in-1 { animation-delay: 0.05s; opacity: 0; }
  .anim-in-2 { animation-delay: 0.15s; opacity: 0; }
  .anim-in-3 { animation-delay: 0.25s; opacity: 0; }
  .anim-in-4 { animation-delay: 0.35s; opacity: 0; }
  .anim-in-5 { animation-delay: 0.45s; opacity: 0; }

  /* Progress bar */
  .progress-track {
    height: 3px;
    background: #f0e4d8;
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #c0605a, #c8a96e);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  /* Suggestion chip active */
  .suggestion-chip-active {
    background: #f7d6d0 !important;
    border-color: #c0605a !important;
    color: #8e3e3a !important;
  }
`;

function countWords(text) {
  const normalized = text.trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}

export default function Create() {
  const navigate = useNavigate();
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [stems, setStems] = useState([]);
  const [note, setNote] = useState("");
  const [presetRequest, setPresetRequest] = useState(null);
  const [situationText, setSituationText] = useState("");
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [showAllBouquetSuggestions, setShowAllBouquetSuggestions] = useState(false);
  const [showAllNoteSuggestions, setShowAllNoteSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("build"); // "build" | "note" | "ai"
  const hasTrackedContentRef = useRef(false);

  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const hasBouquetContent = flowerCount > 0 || note.trim().length > 0;
  const offerActive = isLaunchOfferActive();
  const smallPrice = getSmallPlanPrice();
  const unlimitedPrice = getUnlimitedPlanPrice();

  // Progress: 0-100
  const progress = Math.min(100, (flowerCount > 0 ? 40 : 0) + Math.min(60, wordCount * 4));

  const canRequestAiNote = useMemo(() => situationText.trim().length > 0 && !isGeneratingNote, [situationText, isGeneratingNote]);
  const visibleBouquetSuggestions = showAllBouquetSuggestions ? bouquetSuggestions : bouquetSuggestions.slice(0, 4);
  const visibleNoteSuggestions = showAllNoteSuggestions ? noteSuggestions : noteSuggestions.slice(0, 4);

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
        offers: {
          "@type": "AggregateOffer",
          lowPrice: String(smallPrice),
          highPrice: String(unlimitedPrice),
          offerCount: "2",
          priceCurrency: "INR",
        },
        url: `${window.location.origin}/create`,
        description: "Create a digital bouquet and add a personalized note.",
      },
    });
    track("create_start", { source: "create_page" });
    trackEvent("create_start", { source: "create_page" });
  }, [smallPrice, unlimitedPrice]);

  useEffect(() => {
    if (hasTrackedContentRef.current || !hasBouquetContent) return;
    hasTrackedContentRef.current = true;
    const payload = { flowerCount, wordCount };
    track("create_content_added", payload);
    trackEvent("create_content_added", payload);
  }, [flowerCount, hasBouquetContent, wordCount]);

  useEffect(() => {
    const draft = loadCheckoutDraft();
    if (!draft) return;
    if (draft.note) setNote(draft.note);
    if (Array.isArray(draft.stems) && draft.stems.length) {
      setPresetRequest({ id: `draft_${Date.now()}`, stems: draft.stems });
    }
  }, []);

  useEffect(() => {
    saveCheckoutDraft({ stems, note });
  }, [stems, note]);

  const handleCanvasStateChange = useCallback((nextStems) => {
    if (!Array.isArray(nextStems)) return;
    setStems(nextStems);
  }, []);

  const applyBouquetSuggestion = (suggestion) => {
    const generatedStems = suggestion.build();
    if (!generatedStems.length) return;
    setPresetRequest({ id: `${suggestion.id}_${Date.now()}`, stems: generatedStems });
  };

  const generateAiNote = async () => {
    if (!canRequestAiNote) return;
    setGenerationError("");
    setIsGeneratingNote(true);
    try {
      const generatedNote = await generateNoteWithGrok({ situation: situationText });
      setNote(generatedNote);
      setActiveTab("note"); // show note tab after generation
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Could not generate note right now.");
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const goToPayment = () => {
    if (!hasBouquetContent) return;
    saveCheckoutDraft({ stems, note });
    const payload = { flowerCount, wordCount };
    track("payment_page_open", payload);
    trackEvent("payment_page_open", payload);
    navigate("/payment", { state: { flowerCount, stems, note } });
  };

  return (
    <main className="create-root pb-32">
      <style>{pageStyles}</style>

      {/* ── STICKY TOP NAV ─────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-rose-100/60 bg-[#faf6f0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            {/* Mini progress */}
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-[11px] text-stone-400">{progress}% done</span>
              <div className="progress-track w-20">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <Link
              to="/"
              className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-medium text-rose-700 transition hover:bg-rose-50"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-5">

        {/* ── PAGE TITLE ─────────────────────────────────── */}
        <div className="anim-in anim-in-1 mb-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">Bouquet builder</p>
          <h1
            className="mt-1 text-[2rem] font-light leading-tight text-stone-800"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Create something <em>beautiful</em>
          </h1>
          <p className="mt-1.5 text-[13px] text-stone-500">
            Add flowers · write a note · share instantly
          </p>
          {/* Mobile progress bar */}
          <div className="mx-auto mt-3 max-w-xs">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-stone-400">{progress}% complete</p>
          </div>
        </div>

        {/* ── CANVAS ─────────────────────────────────────── */}
        <section className="anim-in anim-in-2 mb-4">
          <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Your canvas</p>
                <p
                  className="text-base font-light text-stone-800 leading-tight"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  Arrange your bouquet
                </p>
              </div>
              {/* Stats pills */}
              <div className="ml-auto flex gap-1.5">
                <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                  🌸 {flowerCount}
                </span>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  ✍ {wordCount}w
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <CanvasBoard
                selectedFlower={selectedFlower}
                onCanvasStateChange={handleCanvasStateChange}
                presetRequest={presetRequest}
              />
            </div>
          </div>
        </section>

        {/* ── TAB SWITCHER (mobile-friendly) ─────────────── */}
        <div className="anim-in anim-in-3 mb-4">
          <div className="flex gap-2 rounded-2xl border border-stone-100 bg-white p-1.5 shadow-sm">
            {[
              { id: "build", label: "🌸 Flowers", desc: "Pick & suggest" },
              { id: "note", label: "✍️ Note", desc: "Write message" },
              { id: "ai", label: "✨ AI Note", desc: "Auto-generate" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex-1 rounded-xl px-2 py-2.5 text-center transition-all duration-150",
                  activeTab === tab.id
                    ? "bg-[#3a3028] text-white shadow-md"
                    : "text-stone-500 hover:bg-stone-50",
                ].join(" ")}
              >
                <div className="text-[13px] font-semibold leading-none">{tab.label}</div>
                <div className={`mt-0.5 text-[10px] leading-none ${activeTab === tab.id ? "text-rose-200" : "text-stone-400"}`}>
                  {tab.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────── */}

        {/* BUILD TAB */}
        {activeTab === "build" && (
          <div className="anim-in anim-in-4 space-y-4">
            {/* Flower picker */}
            <FlowerPicker onPick={setSelectedFlower} selectedFlower={selectedFlower} />

            {/* Bouquet suggestions */}
            <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Quick styles</p>
                  <p
                    className="text-base font-light text-stone-800 leading-tight"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                  >
                    Bouquet presets
                  </p>
                </div>
                {bouquetSuggestions.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBouquetSuggestions((v) => !v)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    {showAllBouquetSuggestions ? "Less" : "See all"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {visibleBouquetSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => applyBouquetSuggestion(suggestion)}
                    className="rounded-xl border border-rose-100 bg-[#faf6f0] px-3 py-2.5 text-left transition-all hover:border-rose-300 hover:bg-rose-50 active:scale-[0.97]"
                  >
                    <p className="text-[13px] font-semibold text-stone-800 leading-tight">{suggestion.title}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500 leading-tight">{suggestion.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOTE TAB */}
        {activeTab === "note" && (
          <div className="anim-in anim-in-4 space-y-4">
            <NoteCard text={note} setText={setNote} />

            {/* Note suggestions */}
            <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600">Need ideas?</p>
                  <p
                    className="text-base font-light text-stone-800 leading-tight"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                  >
                    Note suggestions
                  </p>
                </div>
                {noteSuggestions.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllNoteSuggestions((v) => !v)}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    {showAllNoteSuggestions ? "Less" : "See all"}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {visibleNoteSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNote(suggestion)}
                    className={[
                      "w-full rounded-xl border px-3 py-2.5 text-left text-[13px] leading-relaxed transition-all active:scale-[0.98]",
                      note === suggestion
                        ? "border-[#c0605a] bg-[#f7d6d0] text-[#8e3e3a]"
                        : "border-amber-100 bg-[#fffdf8] text-stone-700 hover:border-amber-300",
                    ].join(" ")}
                    style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "15px" }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === "ai" && (
          <div className="anim-in anim-in-4">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md">
                  <span className="text-base">✨</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-600">Powered by AI</p>
                  <p
                    className="text-base font-light text-stone-800 leading-tight"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                  >
                    Generate your note
                  </p>
                </div>
              </div>

              <p className="mb-3 text-[13px] text-stone-500 leading-relaxed">
                Tell us the occasion and AI will write a heartfelt note for you.
              </p>

              <textarea
                id="situation-note"
                rows={4}
                value={situationText}
                onChange={(e) => setSituationText(e.target.value)}
                placeholder="E.g. We had a tough week and I want to apologize and make her smile."
                className="w-full resize-none rounded-xl border border-sky-100 bg-[#f7fbff] p-3 text-[14px] text-stone-800 outline-none transition placeholder:text-stone-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />

              <button
                type="button"
                onClick={generateAiNote}
                disabled={!canRequestAiNote}
                className={[
                  "mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold uppercase tracking-[0.12em] transition-all active:scale-[0.98]",
                  canRequestAiNote
                    ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200 hover:from-sky-600 hover:to-blue-600"
                    : "cursor-not-allowed bg-stone-100 text-stone-400",
                ].join(" ")}
              >
                {isGeneratingNote ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Writing your note...
                  </>
                ) : (
                  <>✨ Generate Note</>
                )}
              </button>

              {generationError && (
                <p className="mt-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                  {generationError}
                </p>
              )}

              {note && (
                <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Note generated ✓</p>
                  <p className="mt-1 text-[13px] text-emerald-900 leading-relaxed italic" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                    "{note.slice(0, 80)}{note.length > 80 ? "…" : ""}"
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("note")}
                    className="mt-2 text-[11px] font-semibold text-emerald-700 underline underline-offset-2"
                  >
                    View & edit →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── OFFER BANNER ─────────────────────────────── */}
        {offerActive && (
          <div className="anim-in anim-in-5 mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-3">
            <span className="text-xl">🌸</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-stone-800 leading-tight">Launch offer active</p>
              <p className="text-[11px] text-stone-500">From ₹{smallPrice} · {getOfferDateLabel()}</p>
            </div>
            <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              Limited
            </span>
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM CTA (mobile) ─────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100/60 bg-[#faf6f0]/97 px-4 pb-safe pt-3 pb-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={goToPayment}
            disabled={!hasBouquetContent}
            className={[
              "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold uppercase tracking-[0.12em] transition-all active:scale-[0.98]",
              hasBouquetContent
                ? "bg-[#3a3028] text-[#faf6f0] shadow-lg shadow-stone-900/20 hover:bg-[#8e3e3a]"
                : "cursor-not-allowed bg-stone-200 text-stone-400",
            ].join(" ")}
          >
            {hasBouquetContent ? (
              <>
                Continue to checkout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              "Add flowers or a note to continue"
            )}
          </button>
          <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-stone-400">
            <span>🔒 Secure checkout</span>
            <span>·</span>
            <span>From ₹{smallPrice}</span>
            <span>·</span>
            <span>One-time only</span>
          </div>
        </div>
      </div>
    </main>
  );
}