import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SoftButton from "../components/SoftButton";
import { formatUsdFromCents, getOfferDateLabel, getSmallPlanUsdCents, getUnlimitedPlanUsdCents, isLaunchOfferActive } from "../lib/pricing";
import { applySeo, seoKeywords } from "../lib/seo";

/*  SVG Doodles  */
function DoodleFlower({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M40 40 C40 40 36 28 40 22 C44 28 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M40 40 C40 40 52 36 58 40 C52 44 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M40 40 C40 40 44 52 40 58 C36 52 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M40 40 C40 40 28 44 22 40 C28 36 40 40 40 40Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M40 40 C40 40 30 30 29 24 C35 27 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M40 40 C40 40 50 30 56 29 C53 35 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M40 40 C40 40 50 50 51 56 C45 53 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M40 40 C40 40 30 50 24 51 C27 45 40 40 40 40Z" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="40" r="4" fill="#f7d6d0" stroke="#c0605a" strokeWidth="1.5" />
    </svg>
  );
}

function DoodleStar({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M20 4 L21.8 15.5 L33 12 L24.5 20 L33 28 L21.8 24.5 L20 36 L18.2 24.5 L7 28 L15.5 20 L7 12 L18.2 15.5 Z" stroke="#c8a96e" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function DoodleHeart({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 50 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M25 42 C25 42 4 28 4 15 C4 8 9 3 16 4 C20 4.5 23 7 25 10 C27 7 30 4.5 34 4 C41 3 46 8 46 15 C46 28 25 42 25 42Z" stroke="#c0605a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M15 12 C13 12 11 14 11 17" stroke="#e8a9a4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DoodleLeaf({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M25 55 C25 55 8 40 10 20 C15 8 25 5 25 5 C25 5 35 8 40 20 C42 40 25 55 25 55Z" stroke="#7a9e72" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M25 55 L25 10" stroke="#7a9e72" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M25 38 C20 34 14 32 12 28" stroke="#7a9e72" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M25 38 C30 34 36 32 38 28" stroke="#7a9e72" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DoodleSparkle({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M15 2 L15 28M2 15 L28 15" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 6 L24 24M24 6 L6 24" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function DoodleCurlyLine({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M2 12 C12 4 22 20 32 12 C42 4 52 20 62 12 C72 4 82 20 92 12 C102 4 112 20 118 12" stroke="#f2cfc8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DoodleWreathLeft({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 60 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M30 190 C28 160 32 130 26 100 C22 75 28 50 24 20" stroke="#7a9e72" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26 160 C18 152 10 148 8 140 C16 138 24 144 26 160Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <path d="M28 130 C36 120 44 118 48 110 C40 108 32 116 28 130Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <path d="M26 100 C16 94 8 88 6 78 C14 78 22 86 26 100Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <path d="M28 70 C36 62 44 56 50 46 C42 46 34 56 28 70Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <circle cx="24" cy="40" r="5" stroke="#c0605a" strokeWidth="1.5" fill="none" />
      <path d="M24 35 L24 28M29 40 L36 40M24 45 L24 52M19 40 L12 40" stroke="#c0605a" strokeWidth="1" strokeLinecap="round" />
      <circle cx="32" cy="155" r="4" stroke="#e8a9a4" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

function DoodleWreathRight({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 60 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M30 190 C32 160 28 130 34 100 C38 75 32 50 36 20" stroke="#7a9e72" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M34 160 C42 152 50 148 52 140 C44 138 36 144 34 160Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <path d="M32 130 C24 120 16 118 12 110 C20 108 28 116 32 130Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <path d="M34 100 C44 94 52 88 54 78 C46 78 38 86 34 100Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <path d="M32 70 C24 62 16 56 10 46 C18 46 26 56 32 70Z" stroke="#7a9e72" strokeWidth="1.2" fill="none" />
      <circle cx="36" cy="40" r="5" stroke="#c0605a" strokeWidth="1.5" fill="none" />
      <path d="M36 35 L36 28M41 40 L48 40M36 45 L36 52M31 40 L24 40" stroke="#c0605a" strokeWidth="1" strokeLinecap="round" />
      <circle cx="28" cy="155" r="4" stroke="#e8a9a4" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

function DoodleBow({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M40 20 C35 14 22 8 12 12 C8 16 10 24 16 26 C26 30 38 22 40 20Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M40 20 C45 14 58 8 68 12 C72 16 70 24 64 26 C54 30 42 22 40 20Z" stroke="#c0605a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="20" r="3" fill="#f7d6d0" stroke="#c0605a" strokeWidth="1.5" />
      <path d="M40 23 L37 34M40 23 L43 34" stroke="#c0605a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/*  styles  */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

  @keyframes floatPetal {
    0%,100% { transform: translateY(0px) rotate(0deg); opacity:.7; }
    50%      { transform: translateY(-16px) rotate(7deg); opacity:1; }
  }
  @keyframes driftIn {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmerText {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes badgePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(192,96,90,.35); }
    50%     { box-shadow: 0 0 0 7px rgba(192,96,90,0); }
  }

  .p1 { animation: floatPetal 4s ease-in-out infinite; }
  .p2 { animation: floatPetal 5.5s ease-in-out infinite 1.2s; }
  .p3 { animation: floatPetal 3.8s ease-in-out infinite .6s; }
  .p4 { animation: floatPetal 6s ease-in-out infinite 2s; }

  .d1 { animation: driftIn .55s ease forwards; }
  .d2 { animation: driftIn .55s ease .12s forwards; opacity:0; }
  .d3 { animation: driftIn .55s ease .24s forwards; opacity:0; }
  .d4 { animation: driftIn .55s ease .36s forwards; opacity:0; }
  .d5 { animation: driftIn .55s ease .48s forwards; opacity:0; }

  .wds-ribbon {
    background: linear-gradient(90deg, #c0605a 0%, #e8a9a4 40%, #c8a96e 70%, #c0605a 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerText 4s linear infinite;
  }

  .badge-pulse { animation: badgePulse 2.2s ease-in-out infinite; }

  .home-root { font-family: 'Jost', sans-serif; }
`;

export default function Home() {
  const navigate = useNavigate();
  const offerActive = isLaunchOfferActive();
  const smallPriceCents = getSmallPlanUsdCents();
  const unlimitedPriceCents = getUnlimitedPlanUsdCents();
  const smallPrice = formatUsdFromCents(smallPriceCents);
  const unlimitedPrice = formatUsdFromCents(unlimitedPriceCents);

  const testimonials = useMemo(() => [
    { quote: "I sent this in 2 minutes and it felt so personal, not generic at all.", author: "Aditi", city: "Mumbai" },
    { quote: "The flowers looked so premium on mobile. She cried happy tears ", author: "Priya", city: "Hyderabad" },
    { quote: "Instant share link after payment was exactly what I needed.", author: "Neha", city: "Delhi" },
    { quote: "I sent it to my mom and she called me immediately.", author: "Shruti", city: "Pune" },
  ], []);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    applySeo({
      title: "Online Bouquet Maker | Send Digital Bouquet with Note",
      description: "Create and send a digital bouquet with a personal note in minutes. Choose your bouquet style, add your message, and share instantly.",
      keywords: seoKeywords.home,
      path: "/",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", name: "Petals and Words", url: window.location.origin, description: "Online bouquet maker for creating and sharing digital flowers with personal notes." },
          { "@type": "SoftwareApplication", name: "Petals and Words Bouquet Maker", applicationCategory: "LifestyleApplication", operatingSystem: "Web", offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: (smallPriceCents / 100).toFixed(2), highPrice: (unlimitedPriceCents / 100).toFixed(2), offerCount: "2" }, url: `${window.location.origin}/create` },
          { "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "What is the starting price?", acceptedAnswer: { "@type": "Answer", text: `Paid bouquet plans start from ${smallPrice}, with an Unlimited option at ${unlimitedPrice}.` } }, { "@type": "Question", name: "Can I use it as an online flower bouquet maker with sharing?", acceptedAnswer: { "@type": "Answer", text: "Yes. Build your bouquet, complete checkout, and share the generated link through WhatsApp or other apps." } }] },
        ],
      },
    });
  }, [smallPrice, smallPriceCents, unlimitedPrice, unlimitedPriceCents]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsSliding(true);
      window.setTimeout(() => {
        setActiveIdx((v) => (v + 1) % testimonials.length);
        setIsSliding(false);
      }, 220);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  return (
    <main className="home-root relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #fdf6f0 0%, #fceef0 50%, #fdf8f0 100%)" }}>
      <style>{styles}</style>

      {/*  Ambient background blobs  */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-pink-200/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      {/*  Scattered background doodles  */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <DoodleFlower className="absolute -top-2 -left-4 w-20 h-20 opacity-20 p1" />
        <DoodleFlower className="absolute top-8 right-4 w-14 h-14 opacity-15 p2" />
        <DoodleSparkle className="absolute top-20 left-1/4 w-8 h-8 opacity-25 p3" />
        <DoodleStar className="absolute top-6 right-1/4 w-10 h-10 opacity-20 p2" />
        <DoodleHeart className="absolute top-1/3 -left-2 w-12 h-12 opacity-15 p4" />
        <DoodleLeaf className="absolute top-1/3 -right-2 w-10 h-12 opacity-15 p1" />
        <DoodleSparkle className="absolute top-1/2 right-8 w-7 h-7 opacity-20 p3" />
        <DoodleStar className="absolute bottom-32 left-6 w-9 h-9 opacity-20 p2" />
        <DoodleFlower className="absolute bottom-20 -right-3 w-16 h-16 opacity-15 p1" />
        <DoodleHeart className="absolute bottom-10 left-1/3 w-10 h-9 opacity-20 p4" />
      </div>

      <div className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-4 pb-16 pt-5">

        {/*  Highlight Banner  */}
        <div className="d1 w-full">
          <div className="relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-3"
            style={{ background: "linear-gradient(135deg, #3a3028 0%, #8e3e3a 60%, #c0605a 100%)" }}>
            <DoodleWreathLeft className="absolute left-0 top-0 h-full w-10 opacity-40" />
            <DoodleWreathRight className="absolute right-0 top-0 h-full w-10 opacity-40" />
            <div className="relative flex flex-col items-center text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-200">Send Love Today</p>
              <p className="mt-0.5 text-[18px] font-semibold leading-tight text-white" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                Share a Beautiful Bouquet</p>
              <p className="mt-0.5 text-[11px] text-rose-100/90">Make someone feel special with flowers and words</p>
            </div>
          </div>
        </div>

        {/*  Hero card  */}
        <section className="d2 relative w-full overflow-hidden rounded-[2rem] border border-rose-100 bg-white/85 px-6 py-8 text-center shadow-2xl shadow-rose-200/30 backdrop-blur sm:px-10 sm:py-10">

          {/* Corner doodles */}
          <DoodleFlower className="absolute -top-3 -left-3 w-16 h-16 opacity-30 p2" />
          <DoodleFlower className="absolute -top-3 -right-3 w-16 h-16 opacity-25 p3" style={{ transform: "scaleX(-1)" }} />
          <DoodleBow className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-10 opacity-55" />
          <DoodleLeaf className="absolute -bottom-2 -left-2 w-10 h-12 opacity-20 p4" />
          <DoodleLeaf className="absolute -bottom-2 -right-2 w-10 h-12 opacity-20 p1" style={{ transform: "scaleX(-1)" }} />

          {/* Curly line top accent */}
          <DoodleCurlyLine className="mx-auto mb-3 mt-7 w-28 opacity-50" />

          <img src="/logo-transparent.png" alt="Petals and Words logo"
            className="mx-auto mb-3 w-full max-w-[240px] sm:max-w-[280px]" />

          {/* Section label */}
          <div className="mb-2 flex items-center justify-center gap-2">
            <DoodleStar className="w-5 h-5 opacity-70" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-600">Made for Meaningful Moments</p>
            <DoodleStar className="w-5 h-5 opacity-70" />
          </div>

          <h1 className="text-balance text-[2.1rem] font-light leading-tight text-stone-900 sm:text-5xl"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Send flowers{" "}
            <em className="wds-ribbon">she'll never forget</em>
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-pretty text-[14px] leading-relaxed text-stone-500 sm:text-[15px]">
            A digital bouquet with your words, delivered in seconds - for family, friends, or anyone you care about.
          </p>

          {/* Occasion chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["For Mom", "For Best Friend", "For Partner", "For Family"].map((label) => (
              <span key={label}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[12px] font-medium text-rose-700">
                {label}
              </span>
            ))}
          </div>

          {/* Offer badge */}
          <div className="mx-auto mt-4 w-fit">
            <div className="badge-pulse rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50 px-4 py-2 text-[12px] font-semibold text-stone-700">
              {offerActive
                ? `Limited-time offer: from ${smallPrice} | ${getOfferDateLabel()}`
                : `One-time plans from ${smallPrice} | No subscription`}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <button
              onClick={() => navigate("/create")}
              className="inline-flex min-h-[52px] w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#3a3028] px-8 text-[14px] font-semibold uppercase tracking-[0.1em] text-[#faf6f0] shadow-lg shadow-stone-900/20 transition-all hover:-translate-y-0.5 hover:bg-[#8e3e3a] active:scale-[.98]"
            >
              Create bouquet
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-stone-400">No login | Ready in 60 seconds | Instant share</p>
          <DoodleCurlyLine className="mx-auto mt-4 w-28 opacity-40" style={{ transform: "rotate(180deg)" }} />
        </section>

        {/*  How it works  */}
        <section className="d3 w-full rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-md backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <DoodleHeart className="w-6 h-5 opacity-70 shrink-0" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-600">How it works</p>
          </div>
          <div className="space-y-3">
            {[
              { n: "1", emoji: "", title: "Pick your flowers", desc: "Choose stems and arrange them into a bouquet they'll love." },
              { n: "2", emoji: "", title: "Write from the heart", desc: "Add a personal note or let AI write one for you." },
              { n: "3", emoji: "", title: "Pay and share instantly", desc: "One-time payment. Get a link. Send over WhatsApp in seconds." },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3 rounded-xl border border-rose-50 bg-[#faf6f0] px-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3a3028] text-[12px] font-bold text-white">
                  {s.n}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-stone-800">{s.emoji} {s.title}</p>
                  <p className="text-[12px] leading-relaxed text-stone-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/*  Testimonials  */}
        <section className="d4 relative w-full overflow-hidden rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-md backdrop-blur">
          <DoodleFlower className="absolute -top-2 -right-2 w-14 h-14 opacity-20 p1" />
          <div className="mb-3 flex items-center gap-2">
            <DoodleStar className="w-5 h-5 opacity-60 shrink-0" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-600">What people say</p>
          </div>
          <div
            className="overflow-hidden rounded-xl border border-rose-50 bg-[#faf6f0] p-4 transition-all duration-200 ease-out"
            style={{ transform: isSliding ? "translateX(-20px)" : "translateX(0)", opacity: isSliding ? 0 : 1 }}
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-500">5 out of 5</p>
            <p className="text-[15px] italic leading-relaxed text-stone-700"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              "{testimonials[activeIdx].quote}"
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-[13px] font-semibold text-rose-700 shrink-0">
                {testimonials[activeIdx].author[0]}
              </div>
              <p className="text-[12px] font-semibold text-stone-600">
                {testimonials[activeIdx].author}, {testimonials[activeIdx].city}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {testimonials.map((t, i) => (
              <span key={t.author}
                className={["h-1.5 rounded-full transition-all duration-300", i === activeIdx ? "w-6 bg-rose-500" : "w-2 bg-rose-200"].join(" ")} />
            ))}
          </div>
        </section>

        {/*  Dark message card  */}
        <section className="d4 relative w-full overflow-hidden rounded-2xl px-5 py-7 text-center"
          style={{ background: "linear-gradient(135deg, #3a3028 0%, #5c3a34 60%, #8e3e3a 100%)" }}>
          <DoodleWreathLeft className="absolute left-0 top-0 h-full w-12 opacity-30" />
          <DoodleWreathRight className="absolute right-0 top-0 h-full w-12 opacity-30" />
          <DoodleSparkle className="absolute top-3 right-12 w-6 h-6 opacity-40 p2" />
          <DoodleSparkle className="absolute bottom-4 left-14 w-5 h-5 opacity-30 p3" />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-300">Thoughtful Gifts Made Easy</p>
            <p className="mt-2 text-[1.65rem] font-light leading-snug text-white"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              <em>They deserve more than a text.</em>
            </p>
            <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-rose-100/90">
              Make someone in your life feel truly seen today. A bouquet and your words - a gift they'll screenshot and save.
            </p>
            <button
              onClick={() => navigate("/create")}
              className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 text-[13px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur transition-all hover:bg-white/20 active:scale-[.98]"
            >
              Make a bouquet now
            </button>
          </div>
        </section>

        {/*  SEO pages  */}
        <section className="d5 w-full rounded-2xl border border-stone-100 bg-white/70 p-4 shadow-sm backdrop-blur">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400">Explore more</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/virtual-bouquet-maker" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-[13px] font-medium text-rose-700 transition hover:bg-rose-50 hover:border-rose-300">
               Virtual Bouquet Maker
            </Link>
            <Link to="/digital-bouquet-maker" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-[13px] font-medium text-rose-700 transition hover:bg-rose-50 hover:border-rose-300">
               Digital Bouquet Maker
            </Link>
            <Link to="/online-bouquet-maker" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-[13px] font-medium text-rose-700 transition hover:bg-rose-50 hover:border-rose-300">
               Online Bouquet Maker
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
