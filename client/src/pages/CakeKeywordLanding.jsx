import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SoftButton from "../components/SoftButton";

import { applySeo } from "../lib/seo";

const CAKE_LANDING_CONTENT = {
  "/tl/virtual-cake-anniversary": {
    title: "Virtual Cake Anniversary (Tagalog)",
    seoTitle: "Virtual Cake para sa Anibersaryo | Magpadala Online",
    description: "Gumawa ng virtual cake para sa inyong anibersaryo. Magdagdag ng mensahe at i-share agad ang link nang libre.",
    keywords: ["virtual cake anniversary tagalog", "virtual cake philippines", "padala cake online"],
    intro: "I-celebrate ang inyong anniversary kahit magkalayo kayo gamit ang aming 3D Virtual Cake builder.",
    faq: [
      { q: "Libre ba ito?", a: "Oo, libreng gumawa at mag-share ng virtual cake." },
      { q: "Pwede ba maglagay ng sariling message?", a: "Oo, pwede kang mag-type ng personal na mensahe na babasahin nila." },
    ],
  },
  "/es/pastel-de-cumpleanos-virtual": {
    title: "Pastel de Cumpleaños Virtual (Spanish)",
    seoTitle: "Pastel de Cumpleaños Virtual | Enviar Online Gratis",
    description: "Crea un pastel de cumpleaños virtual en 3D. Escribe un mensaje personal y envía el enlace al instante.",
    keywords: ["pastel de cumpleaños virtual", "torta de cumpleaños online", "enviar pastel virtual"],
    intro: "Sorprende a alguien especial en su cumpleaños con un pastel virtual en 3D interactivo.",
    faq: [
      { q: "¿Es gratis?", a: "Sí, puedes diseñar y enviar tu pastel de forma totalmente gratuita." },
      { q: "¿Se puede enviar por WhatsApp?", a: "Sí, se generará un enlace que puedes compartir en cualquier aplicación." },
    ],
  },
  "/bn/virtual-janmadin-cake": {
    title: "ভার্চুয়াল জন্মদিন কেক (Bengali)",
    seoTitle: "ভার্চুয়াল জন্মদিন কেক | বিনামূল্যে অনলাইনে পাঠান",
    description: "আপনার প্রিয়জনকে চমকে দিতে একটি ভার্চুয়াল 3D জন্মদিন কেক তৈরি করুন। একটি বার্তা যোগ করুন এবং শেয়ার করুন।",
    keywords: ["virtual janmadin cake", "birthday cake online bengali", "free virtual cake"],
    intro: "আমাদের 3D ভার্চুয়াল কেক মেকার দিয়ে একটি সুন্দর জন্মদিনের কেক তৈরি করুন এবং সাথে একটি মিষ্টি বার্তা পাঠান।",
    faq: [
      { q: "এটি কি বিনামূল্যে?", a: "হ্যাঁ, এটি সম্পূর্ণ বিনামূল্যে।" },
      { q: "আমি কি কেকের স্বাদ বেছে নিতে পারি?", a: "হ্যাঁ, আপনি চকোলেট, ভ্যানিলা, স্ট্রবেরি ইত্যাদি বেছে নিতে পারেন।" },
    ],
  },
};

export default function CakeKeywordLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = useMemo(() => CAKE_LANDING_CONTENT[location.pathname] ?? CAKE_LANDING_CONTENT["/es/pastel-de-cumpleanos-virtual"], [location.pathname]);

  useEffect(() => {
    const faqEntities = (page.faq || []).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    }));

    applySeo({
      title: page.seoTitle,
      description: page.description,
      keywords: page.keywords,
      path: location.pathname,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            name: page.seoTitle,
            url: `${window.location.origin}${location.pathname}`,
            description: page.description,
          },
          {
            "@type": "FAQPage",
            mainEntity: faqEntities,
          },
        ],
      },
    });
  }, [location.pathname, page]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:py-12">
      <section className="rounded-[2rem] border border-rose-200/70 bg-white/85 p-6 shadow-2xl shadow-rose-200/30 backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-e91e63">Petals and Words 🎂</p>
        <h1 className="mt-2 text-4xl text-stone-900 sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-700">{page.intro}</p>

        <div className="mt-7">
          <SoftButton text="Create a Virtual Cake" onClick={() => navigate("/create-cake")} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Why a Virtual Cake?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              A 3D virtual cake lets them blow out the candles from anywhere in the world! It's interactive, fun, and memorable.
            </p>
          </article>

          <article className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
            <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Occasions
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              Birthdays, Anniversaries, Graduations, Mother's Day, and Father's Day!
            </p>
          </article>
        </div>

        <article className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Instant Share Link
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Generate a secure link and send it via WhatsApp, Messenger, or email in seconds.
          </p>
        </article>

        <article className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            FAQs
          </h2>
          <div className="mt-3 grid gap-3">
            {(page.faq || []).map((item) => (
              <div key={item.q} className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                <h3 className="text-base font-semibold text-stone-900">{item.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
        
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link to="/" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Home
          </Link>
          <Link to="/create-cake" className="rounded-full border border-pink-200 bg-white px-4 py-2 text-pink-700 hover:border-pink-300">
            Build a Cake
          </Link>
          <Link to="/create" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-rose-700 hover:border-rose-300">
            Build a Bouquet
          </Link>
        </div>
      </section>
    </main>
  );
}
