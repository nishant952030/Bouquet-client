import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SoftButton from "../components/SoftButton";
import { formatUsdFromCents, getOfferDateLabel, getSmallPlanUsdCents, getUnlimitedPlanUsdCents, isLaunchOfferActive } from "../lib/pricing";
import { applySeo } from "../lib/seo";

const LANDING_CONTENT = {
  "/virtual-bouquet-maker": {
    title: "Virtual Bouquet Maker",
    seoTitle: "Virtual Bouquet Maker Online",
    description:
      "Create a virtual bouquet maker design in minutes. Build a bouquet, add a heartfelt note, and share instantly with one link.",
    keywords: [
      "virtual bouquet maker",
      "best virtual bouquet maker online free",
      "virtual flower bouquet maker online free",
      "virtual flower maker",
    ],
    intro:
      "This virtual bouquet maker helps you design flowers online, write your message, and send a beautiful link without printing or shipping.",
  },
  "/digital-bouquet-maker": {
    title: "Digital Bouquet Maker",
    seoTitle: "Digital Bouquet Maker for Personalized Flower Messages",
    description:
      "Use a digital bouquet maker to craft custom flower arrangements and pair them with personal notes for birthdays, apologies, and love messages.",
    keywords: [
      "digital bouquet maker",
      "digital flower bouquet",
      "bouquet with message",
      "online bouquet creator",
    ],
    intro:
      "Build a digital bouquet with your style, add a personal note card, and share through WhatsApp and other apps from one place.",
  },
  "/online-bouquet-maker": {
    title: "Online Bouquet Maker",
    seoTitle: "Online Bouquet Maker and Online Flower Bouquet Maker",
    description:
      "Try our online bouquet maker to create custom bouquets, write notes, and share instantly. Fast and simple online flower bouquet maker.",
    keywords: [
      "online bouquet maker",
      "online flower bouquet maker",
      "bouquet maker online",
      "bouquet maker",
    ],
    intro:
      "If you are searching for an online bouquet maker, this page takes you directly to a fast bouquet builder with message support.",
  },
  "/digital-bouquet-maker-usa": {
    title: "Digital Bouquet Maker USA",
    seoTitle: "Digital Bouquet Maker USA | Send Virtual Flowers Online",
    description:
      "Send virtual flowers in the USA with a digital bouquet maker. Create a bouquet, add your note, and share instantly with one secure link.",
    keywords: [
      "digital bouquet maker usa",
      "send virtual flowers usa",
      "online bouquet usa",
      "virtual bouquet maker usa",
    ],
    intro:
      "Designed for US users who want a fast, thoughtful digital gift. Build your bouquet online and send your message instantly.",
  },
  "/digital-bouquet-maker-uk": {
    title: "Digital Bouquet Maker UK",
    seoTitle: "Digital Bouquet Maker UK | Send Online Flowers with Message",
    description:
      "Create and send online flowers in the UK with a custom message. Build your digital bouquet in minutes and share instantly.",
    keywords: [
      "digital bouquet maker uk",
      "online flowers uk digital",
      "virtual bouquet uk",
      "send bouquet link uk",
    ],
    intro:
      "Built for UK gifting moments: birthdays, anniversaries, apologies, and everyday surprises with a personalised flower note.",
  },
  "/digital-bouquet-maker-canada": {
    title: "Digital Bouquet Maker Canada",
    seoTitle: "Digital Bouquet Maker Canada | Virtual Flower Gift Online",
    description:
      "Use our digital bouquet maker in Canada to create virtual flower gifts with personalised notes. Quick checkout and instant share link.",
    keywords: [
      "digital bouquet maker canada",
      "virtual flower gift canada",
      "online bouquet maker canada",
      "digital flowers canada",
    ],
    intro:
      "A simple digital gifting tool for Canada: choose flowers, write your message, and share a bouquet link in seconds.",
  },
  "/digital-bouquet-maker-australia": {
    title: "Digital Bouquet Maker Australia",
    seoTitle: "Digital Bouquet Maker Australia | Online Virtual Bouquet",
    description:
      "Create a virtual bouquet in Australia with a custom note. Send meaningful digital flowers instantly with one secure link.",
    keywords: [
      "digital bouquet maker australia",
      "virtual bouquet australia",
      "online digital flowers australia",
      "flower message gift australia",
    ],
    intro:
      "Made for Australian users who want quick, personal flower gifting online without delivery delays.",
  },
};

export default function KeywordLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = useMemo(() => LANDING_CONTENT[location.pathname] ?? LANDING_CONTENT["/online-bouquet-maker"], [location.pathname]);
  const smallPrice = formatUsdFromCents(getSmallPlanUsdCents());
  const unlimitedPrice = formatUsdFromCents(getUnlimitedPlanUsdCents());
  const offerActive = isLaunchOfferActive();
  const countryAlternates = useMemo(() => ([
    { hreflang: "x-default", href: "/digital-bouquet-maker" },
    { hreflang: "en-us", href: "/digital-bouquet-maker-usa" },
    { hreflang: "en-gb", href: "/digital-bouquet-maker-uk" },
    { hreflang: "en-ca", href: "/digital-bouquet-maker-canada" },
    { hreflang: "en-au", href: "/digital-bouquet-maker-australia" },
  ]), []);

  useEffect(() => {
    applySeo({
      title: page.seoTitle,
      description: page.description,
      keywords: page.keywords,
      path: location.pathname,
      alternates: countryAlternates,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.seoTitle,
        url: `${window.location.origin}${location.pathname}`,
        description: page.description,
      },
    });
  }, [countryAlternates, location.pathname, page]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:py-12">
      <section className="rounded-[2rem] border border-rose-200/70 bg-white/85 p-6 shadow-2xl shadow-rose-200/30 backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Petals and Words</p>
        <h1 className="mt-2 text-4xl text-stone-900 sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-700">{page.intro}</p>

        <div className="mt-7">
          <SoftButton text="Create Your Bouquet" onClick={() => navigate("/create")} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Why choose this bouquet creator
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              Create bouquets in minutes, add custom notes, and share a clean link. No complex setup and no design experience needed.
            </p>
          </article>

          <article className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
            <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Use cases
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              Perfect for birthday wishes, apology notes, anniversaries, and everyday surprise messages with flowers.
            </p>
          </article>
        </div>

        <article className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Transparent pricing
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Plans start from {smallPrice} with an Unlimited option at {unlimitedPrice}. Checkout supports secure card payments via PayPal.
            {offerActive ? ` Limited offer live (${getOfferDateLabel()}).` : ""}
          </p>
        </article>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link to="/" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Home
          </Link>
          <Link to="/create" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-rose-700 hover:border-rose-300">
            Bouquet Builder
          </Link>
          <Link to="/digital-bouquet-maker-usa" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            USA
          </Link>
          <Link to="/digital-bouquet-maker-uk" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            UK
          </Link>
          <Link to="/digital-bouquet-maker-canada" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Canada
          </Link>
          <Link to="/digital-bouquet-maker-australia" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Australia
          </Link>
        </div>
      </section>
    </main>
  );
}
