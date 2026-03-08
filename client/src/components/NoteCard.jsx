export default function NoteCard({ text, setText }) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

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
        {wordCount > 0 && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            {wordCount}w
          </span>
        )}
      </div>

      {/* Paper-style textarea */}
      <div className="relative">
        {/* Ruled lines decoration */}
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