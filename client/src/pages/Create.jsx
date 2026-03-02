import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import CanvasBoard from "../components/CanvasBoard";
import FlowerPicker from "../components/FlowerPicker";
import NoteCard from "../components/NoteCard";
import { bouquetSuggestions, noteSuggestions } from "../data/bouquetSuggestions";
import { trackEvent } from "../lib/analytics";
import { generateNoteWithGrok } from "../lib/grok";
import { applySeo, seoKeywords } from "../lib/seo";

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
  const hasTrackedContentRef = useRef(false);

  const flowerCount = stems.length;
  const wordCount = countWords(note);
  const hasBouquetContent = flowerCount > 0 || note.trim().length > 0;

  const canRequestAiNote = useMemo(() => situationText.trim().length > 0 && !isGeneratingNote, [situationText, isGeneratingNote]);
  const visibleBouquetSuggestions = showAllBouquetSuggestions ? bouquetSuggestions : bouquetSuggestions.slice(0, 3);
  const visibleNoteSuggestions = showAllNoteSuggestions ? noteSuggestions : noteSuggestions.slice(0, 3);

  useEffect(() => {
    applySeo({
      title: "Create Digital Bouquet Online | Add Flowers and Note",
      description:
        "Create a digital bouquet online, add your personal note, and continue to secure checkout to share your bouquet link instantly.",
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
          lowPrice: "29",
          highPrice: "59",
          offerCount: "2",
          priceCurrency: "INR",
        },
        url: `${window.location.origin}/create`,
        description: "Create a digital bouquet and add a personalized note.",
      },
    });

    track("create_start", { source: "create_page" });
    trackEvent("create_start", { source: "create_page" });
  }, []);

  useEffect(() => {
    if (hasTrackedContentRef.current || !hasBouquetContent) return;

    hasTrackedContentRef.current = true;
    const payload = { flowerCount, wordCount };
    track("create_content_added", payload);
    trackEvent("create_content_added", payload);
  }, [flowerCount, hasBouquetContent, wordCount]);

  const handleCanvasStateChange = useCallback((nextStems) => {
    if (!Array.isArray(nextStems)) return;
    setStems(nextStems);
  }, []);

  const applyBouquetSuggestion = (suggestion) => {
    const generatedStems = suggestion.build();
    if (!generatedStems.length) return;
    setPresetRequest({
      id: `${suggestion.id}_${Date.now()}`,
      stems: generatedStems,
    });
  };

  const generateAiNote = async () => {
    if (!canRequestAiNote) return;
    setGenerationError("");
    setIsGeneratingNote(true);
    try {
      const generatedNote = await generateNoteWithGrok({ situation: situationText });
      setNote(generatedNote);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not generate note right now.";
      setGenerationError(message);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const goToPayment = () => {
    if (!hasBouquetContent) return;

    const payload = {
      flowerCount,
      wordCount,
    };
    track("payment_page_open", payload);
    trackEvent("payment_page_open", payload);

    navigate("/payment", {
      state: {
        flowerCount,
        stems,
        note,
      },
    });
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-3 py-5 pb-24 sm:px-4 md:px-6 md:py-10">
      <header className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div className="min-w-0">
          <img
            src="/logo-transparent.png"
            alt="Petals and Words logo"
            className="mb-2 w-[170px] sm:w-[210px]"
          />
        </div>
        <Link
          to="/"
          className="shrink-0 rounded-full border border-rose-200 bg-white/70 px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-white"
        >
          Home
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <aside className="order-first lg:order-last lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[1.8rem] border border-rose-200/70 bg-white/80 p-4 shadow-2xl shadow-rose-200/30 backdrop-blur sm:p-5">
            <div className="flex justify-center">
              <CanvasBoard selectedFlower={selectedFlower} onCanvasStateChange={handleCanvasStateChange} presetRequest={presetRequest} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-rose-600">Flowers</p>
                <p className="text-lg font-semibold text-rose-900">{flowerCount}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-amber-700">Words</p>
                <p className="text-lg font-semibold text-amber-900">{wordCount}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={goToPayment}
              disabled={!hasBouquetContent}
              className={[
                "mt-4 hidden w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition sm:block",
                hasBouquetContent ? "bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600" : "cursor-not-allowed bg-stone-200 text-stone-500",
              ].join(" ")}
            >
              Continue To Plans
            </button>
            {!hasBouquetContent && <p className="mt-2 text-center text-xs text-stone-500">Add flowers or a note to continue.</p>}
          </div>
        </aside>

        <div className="min-w-0">
          <FlowerPicker onPick={setSelectedFlower} selectedFlower={selectedFlower} />

          <NoteCard text={note} setText={setNote} />

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-rose-200/70 bg-white/80 p-3.5 shadow-lg backdrop-blur sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-700 sm:text-sm">Bouquet suggestions</p>
                {bouquetSuggestions.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBouquetSuggestions((value) => !value)}
                    className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-700 transition hover:border-rose-300"
                  >
                    {showAllBouquetSuggestions ? "Show less" : "See all"}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {visibleBouquetSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => applyBouquetSuggestion(suggestion)}
                    className="w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-left transition hover:border-rose-300 hover:bg-rose-50"
                  >
                    <p className="text-sm font-semibold text-rose-900">{suggestion.title}</p>
                    <p className="text-xs text-rose-700">{suggestion.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200/80 bg-amber-50/40 p-3.5 shadow-lg">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700 sm:text-sm">Note suggestions</p>
                {noteSuggestions.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllNoteSuggestions((value) => !value)}
                    className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-700 transition hover:border-amber-300"
                  >
                    {showAllNoteSuggestions ? "Show less" : "See all"}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {visibleNoteSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNote(suggestion)}
                    className="w-full rounded-xl border border-amber-200 bg-white/90 px-3 py-2 text-left text-[13px] leading-relaxed text-amber-900 transition hover:border-amber-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-sky-200/80 bg-sky-50/40 p-3.5 shadow-lg">
            <label htmlFor="situation-note" className="block text-xs font-medium uppercase tracking-[0.18em] text-sky-700 sm:text-sm">
              Generate note with AI
            </label>
            <p className="mt-1 text-xs text-sky-900">Explain your situation and AI will draft a short note for this bouquet.</p>
            <textarea
              id="situation-note"
              rows={4}
              value={situationText}
              onChange={(event) => setSituationText(event.target.value)}
              placeholder="Example: We had a tough week and I want to apologize and make her smile."
              className="mt-2 w-full resize-none rounded-2xl border border-sky-200 bg-white p-3 text-sm text-sky-950 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="button"
              onClick={generateAiNote}
              disabled={!canRequestAiNote}
              className={[
                "mt-3 w-full rounded-2xl px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] transition",
                canRequestAiNote ? "bg-sky-500 text-white hover:bg-sky-600" : "cursor-not-allowed bg-stone-200 text-stone-500",
              ].join(" ")}
            >
              {isGeneratingNote ? "Generating..." : "Generate Note"}
            </button>
            {generationError && <p className="mt-2 text-xs text-rose-700">{generationError}</p>}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={goToPayment}
          disabled={!hasBouquetContent}
          className={[
            "w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition",
            hasBouquetContent ? "bg-rose-500 text-white" : "cursor-not-allowed bg-stone-200 text-stone-500",
          ].join(" ")}
        >
          Continue To Checkout
        </button>
      </div>
    </main>
  );
}
