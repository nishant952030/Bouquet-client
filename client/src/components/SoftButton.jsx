export default function SoftButton({ text, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-full",
        "px-7 py-3 text-base md:text-lg font-semibold",
        "bg-rose-400 text-rose-950 shadow-lg shadow-rose-200/70",
        "transition duration-200 hover:-translate-y-0.5 hover:bg-rose-300",
        "active:translate-y-0 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2",
        className,
      ].join(" ")}
    >
      {text}
    </button>
  );
}