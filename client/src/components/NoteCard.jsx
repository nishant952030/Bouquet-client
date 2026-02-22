export default function NoteCard({ text, setText }) {
  return (
    <div className="mt-4 rounded-3xl border border-amber-100 bg-white/85 p-3.5 shadow-lg backdrop-blur sm:mt-5 sm:p-4">
      <label htmlFor="bouquet-note" className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-amber-700 sm:text-sm">
        Your note
      </label>
      <textarea
        id="bouquet-note"
        placeholder="Write a short message they will keep..."
        className="min-h-28 w-full resize-none rounded-2xl border border-amber-100 bg-amber-50/40 p-3 text-[15px] leading-relaxed text-amber-950 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}