import { useEffect } from "react";
import { Link } from "react-router-dom";
import SoftButton from "../components/SoftButton";
import { useNavigate } from "react-router-dom";
import { applySeo, seoKeywords } from "../lib/seo";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    applySeo({
      title: "Virtual Bouquet Maker | Digital and Online Bouquet Maker",
      description:
        "Petals and Words is a virtual bouquet maker and digital bouquet maker. Create an online flower bouquet, add a personal note, and share it in minutes.",
      keywords: seoKeywords.home,
      path: "/",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "Petals and Words",
            url: window.location.origin,
            description: "Virtual bouquet maker for creating and sharing digital flowers with personal notes.",
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is this a free virtual bouquet maker?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. You can create a bouquet in free preview and upgrade only when you want more flowers or longer notes.",
                },
              },
              {
                "@type": "Question",
                name: "Can I use it as an online flower bouquet maker with sharing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Build your bouquet, complete checkout, and share the generated link through WhatsApp or other apps.",
                },
              },
            ],
          },
        ],
      },
    });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-10">
      <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-rose-200/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
        <section className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/75 p-8 text-center shadow-2xl shadow-rose-200/40 backdrop-blur md:p-12">
          <img
            src="/logo-transparent.png"
            alt="Petals and Words logo"
            className="mx-auto mb-4 w-full max-w-[280px] sm:max-w-[320px]"
          />
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Petals and Words</p>
          <h1 className="text-balance text-4xl font-semibold text-stone-900 md:text-6xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Online Bouquet Maker
          </h1>
          <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-stone-600 md:text-base">
            Build a custom bouquet online and pair it with words that feel personal. Send flowers with a note for love, birthdays, apologies, or any special moment.
          </p>

          <div className="mt-8">
            <SoftButton text="Start creating" onClick={() => navigate("/create")} />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-stone-400">No login | Takes one minute</p>
        </section>

        <section className="w-full max-w-3xl rounded-3xl border border-rose-100/80 bg-white/70 p-5 shadow-lg backdrop-blur sm:p-6">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Create a virtual bouquet with a heartfelt message
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700 sm:text-base">
            Petals and Words is a digital flower bouquet creator for people searching terms like bouquet with message, romantic flower note, birthday flower message, and apology note with flowers.
            Pick your flowers, write your note, and share a clean link instantly.
          </p>
        </section>

        <section className="w-full max-w-3xl rounded-3xl border border-amber-100/80 bg-white/70 p-5 shadow-lg backdrop-blur sm:p-6">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Why people use this bouquet maker online
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700 sm:text-base">
            If you are searching for a virtual bouquet maker, digital bouquet maker, or online bouquet creator, this tool is built for that exact use.
            You can design quickly, write a message, and share in one flow.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-700 sm:text-base">
            Looking for the best virtual bouquet maker online free or a virtual flower bouquet maker online free? Start with free preview, then upgrade only if you need extra flowers and words.
          </p>
        </section>

        <section className="w-full max-w-3xl rounded-3xl border border-stone-100 bg-white/70 p-5 shadow-lg backdrop-blur sm:p-6">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Popular bouquet maker pages
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link to="/virtual-bouquet-maker" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-rose-700 hover:border-rose-300">
              Virtual Bouquet Maker
            </Link>
            <Link to="/digital-bouquet-maker" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-rose-700 hover:border-rose-300">
              Digital Bouquet Maker
            </Link>
            <Link to="/online-bouquet-maker" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-rose-700 hover:border-rose-300">
              Online Bouquet Maker
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
