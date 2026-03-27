import { useState } from "react";
import { generateNoteWithGrok } from "../lib/grok";

export default function NoteCard({ text, setText }) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const [showAi, setShowAi] = useState(false);
  const [situation, setSituation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!situation.trim()) return;
    setIsGenerating(true);
    setError("");
    try {
      const gen = await generateNoteWithGrok({ situation });
      setText(gen);
      setShowAi(false);
      setSituation("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate note.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">✍️</span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600">Step 2</p>
            <label
              htmlFor="bouquet-note"
              className="block text-base font-light text-stone-800 leading-tight cursor-pointer"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Write your note
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wordCount > 0 && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
              {wordCount}w
            </span>
          )}
          <button
            onClick={() => setShowAi(!showAi)}
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:from-sky-500 hover:to-blue-600 active:scale-95"
          >
            ✨ AI Writer
          </button>
        </div>
      </div>

      {/* AI Writer Panel */}
      {showAi && (
        <div className="mb-4 rounded-xl border border-sky-100 bg-[#f7fbff] p-3 shadow-inner">
          <p className="mb-2 text-[12px] font-medium text-sky-700">
            What's the occasion? I'll write a heartfelt note for you.
          </p>
          <textarea
            autoFocus
            rows={2}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g. Apologizing to my best friend for being busy"
            className="w-full resize-none rounded-lg border border-sky-200 p-2 text-[13px] text-stone-800 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200"
          />
          {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !situation.trim()}
              className="flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
            >
              {isGenerating ? (
                <><svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Writing...</>
              ) : (
                "Generate Note"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Paper-style textarea */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #f5e0c0 27px, #f5e0c0 28px)",
            backgroundPosition: "0 36px",
          }}
        />
        <textarea
          id="bouquet-note"
          placeholder="Write a short message they will keep forever..."
          className="relative z-10 min-h-[120px] w-full resize-none rounded-xl border border-amber-100 bg-[#fffdf8] p-3 text-[15px] leading-[1.8] text-stone-800 outline-none transition focus:border-[#c0605a] focus:ring-2 focus:ring-[#c0605a]/20 placeholder:text-stone-300"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <p className="mt-2 text-[11px] text-stone-400">
        Your note is shown alongside the bouquet when the recipient opens the link.
      </p>
    </div>
  );
}