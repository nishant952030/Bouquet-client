import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SoftButton from "../components/SoftButton";
import { getOfferDateLabel, getSmallPlanPrice, getUnlimitedPlanPrice, isLaunchOfferActive } from "../lib/pricing";
import { applySeo, seoKeywords } from "../lib/seo";

export default function Home() {
  const navigate = useNavigate();
  const offerActive = isLaunchOfferActive();
  const smallPrice = getSmallPlanPrice();
  const unlimitedPrice = getUnlimitedPlanPrice();
  const testimonials = useMemo(
    () => [
      {
        quote: "I sent this in 2 minutes and it felt personal, not generic.",
        author: "Aditi, Mumbai",
      },
      {
        quote: "The note card + flowers looked premium on mobile.",
        author: "Arjun, Bengaluru",
      },
      {
        quote: "Instant share link after payment was exactly what I needed.",
        author: "Neha, Delhi",
      },
      {
        quote: "I used it for an apology message and got a positive response immediately.",
        author: "Rahul, Pune",
      },
    ],
    [],
  );
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    applySeo({
      title: "Online Bouquet Maker | Send Digital Bouquet with Note",
      description:
        "Create and send a digital bouquet with a personal note in minutes. Choose your bouquet style, add your message, and share instantly.",
      keywords: seoKeywords.home,
      path: "/",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "Petals and Words",
            url: window.location.origin,
            description: "Online bouquet maker for creating and sharing digital flowers with personal notes.",
          },
          {
            "@type": "SoftwareApplication",
            name: "Petals and Words Bouquet Maker",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "INR",
              lowPrice: String(smallPrice),
              highPrice: String(unlimitedPrice),
              offerCount: "2",
            },
            url: `${window.location.origin}/create`,
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is the starting price?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Paid bouquet plans start from Rs ${smallPrice}, with an Unlimited option at Rs ${unlimitedPrice}.`,
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
  }, [smallPrice, unlimitedPrice]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsSliding(true);
      window.setTimeout(() => {
        setActiveTestimonialIndex((value) => (value + 1) % testimonials.length);
        setIsSliding(false);
      }, 220);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [testimonials.length]);

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
          <p className="mx-auto mt-3 max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            {offerActive
              ? `Limited offer: Small plan Rs ${smallPrice} (${getOfferDateLabel()})`
              : `One-time plans from Rs ${smallPrice}`}
          </p>

          <div className="mt-8">
            <SoftButton text="Start creating" onClick={() => navigate("/create")} />
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.16em] text-stone-400">No login | Takes one minute</p>
        </section>

        <section className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-[0_20px_60px_rgba(244,63,94,0.18)] sm:p-6">
          <div className="pointer-events-none absolute -left-10 top-2 h-24 w-24 rounded-full bg-rose-200/50 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-8 bottom-1 h-24 w-24 rounded-full bg-amber-200/50 blur-2xl" aria-hidden="true" />
          <h2 className="relative text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            What users say
          </h2>
          <article className="relative mt-3 overflow-hidden rounded-2xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur">
            <div className="absolute -left-1 top-1 text-6xl text-rose-200">"</div>
            <div
              className="relative transition-all duration-200 ease-out"
              style={{
                transform: isSliding ? "translateX(-24px)" : "translateX(0)",
                opacity: isSliding ? 0 : 1,
              }}
            >
              <p className="pl-4 text-[15px] leading-relaxed text-stone-700 sm:text-base">"{testimonials[activeTestimonialIndex].quote}"</p>
              <p className="mt-3 pl-4 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">{testimonials[activeTestimonialIndex].author}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 pl-4">
              {testimonials.map((item, index) => (
                <span
                  key={item.author}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    index === activeTestimonialIndex ? "w-7 bg-rose-500" : "w-2 bg-rose-200",
                  ].join(" ")}
                />
              ))}
            </div>
          </article>
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
