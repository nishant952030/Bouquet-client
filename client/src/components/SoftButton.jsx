export default function SoftButton({ text, onClick, className = "", disabled = false, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] select-none";

  const variants = {
    primary:
      "bg-[#3a3028] text-[#faf6f0] shadow-lg shadow-stone-900/20 hover:-translate-y-0.5 hover:bg-[#8e3e3a] hover:shadow-rose-900/25 focus-visible:ring-[#8e3e3a] px-7 py-3.5 text-[13px] tracking-[0.1em] uppercase",
    rose:
      "bg-[#c0605a] text-white shadow-lg shadow-rose-400/30 hover:-translate-y-0.5 hover:bg-[#8e3e3a] focus-visible:ring-[#c0605a] px-7 py-3.5 text-[13px] tracking-[0.1em] uppercase",
    ghost:
      "border border-[#c0605a]/40 bg-white text-[#8e3e3a] hover:bg-[#f7d6d0] hover:border-[#c0605a] focus-visible:ring-[#c0605a] px-6 py-3 text-[13px] tracking-[0.08em] uppercase",
  };

  const disabledStyle = "cursor-not-allowed bg-stone-200 text-stone-400 shadow-none hover:translate-y-0 hover:bg-stone-200";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[base, disabled ? disabledStyle : variants[variant], className].join(" ")}
    >
      {text}
      {!disabled && variant !== "ghost" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}