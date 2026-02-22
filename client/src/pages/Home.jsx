import SoftButton from "../components/SoftButton";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-rose-200/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" aria-hidden="true" />

      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/75 p-8 text-center shadow-2xl shadow-rose-200/40 backdrop-blur md:p-12">
        <img
          src="/logo-transparent.png"
          alt="Petals and Words logo"
          className="mx-auto mb-4 w-full max-w-[280px] sm:max-w-[320px]"
        />
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Petals and Words</p>
        <h1 className="text-balance text-4xl font-semibold text-stone-900 md:text-6xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Petals and Words
        </h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-stone-600 md:text-base">
          Build a hand-picked bouquet and pair it with words that feel personal.
        </p>

        <div className="mt-8">
          <SoftButton text="Start creating" onClick={() => navigate("/create")} />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-stone-400">No login | Takes one minute</p>
      </section>
    </main>
  );
}
