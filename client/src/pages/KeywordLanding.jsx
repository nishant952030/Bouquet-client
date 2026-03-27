import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SoftButton from "../components/SoftButton";
import { formatUsdFromCents, getOfferDateLabel, getSmallPlanUsdCents, getUnlimitedPlanUsdCents, isLaunchOfferActive } from "../lib/pricing";
import { applySeo } from "../lib/seo";

const LANDING_CONTENT = {
  "/virtual-bouquet-maker": {
    title: "Virtual Bouquet Maker",
    seoTitle: "Virtual Bouquet Maker Online | Free Digital Flower Builder",
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
    faq: [
      { q: "Is this virtual bouquet maker free?", a: "Yes. You can build and share your bouquet for free with no signup." },
      { q: "Can I add a personal note?", a: "Yes. Every bouquet can include a custom note before you share the link." },
    ],
  },
  "/virtual-bouquet-maker-online-free": {
    title: "Virtual Bouquet Maker Online Free",
    seoTitle: "Virtual Bouquet Maker Online Free | No Signup",
    description:
      "Use our virtual bouquet maker online free. Pick flowers, write your note, and send one clean bouquet link in under a minute.",
    keywords: [
      "virtual bouquet maker online free",
      "virtual flower bouquet maker online free",
      "free virtual bouquet maker",
      "virtual bouquet free",
    ],
    intro:
      "Built for people searching exactly for a virtual bouquet maker online free: no app install, no signup, and instant sharing.",
    faq: [
      { q: "Do I need to create an account?", a: "No. You can create and share a bouquet without creating an account." },
      { q: "How fast can I send it?", a: "Most bouquets are ready in about a minute, including your custom note." },
    ],
  },
  "/virtual-bouquet": {
    title: "Virtual Bouquet",
    seoTitle: "Virtual Bouquet | Send Digital Flowers with Message",
    description:
      "Send a virtual bouquet with a personal message. Create your flowers online and share instantly through one secure link.",
    keywords: [
      "virtual bouquet",
      "send virtual bouquet",
      "virtual flower gift",
      "digital bouquet",
    ],
    intro:
      "This page is focused on virtual bouquet gifting: simple flower arrangement, heartfelt notes, and instant delivery by link.",
    faq: [
      { q: "What is a virtual bouquet?", a: "A virtual bouquet is a digital flower arrangement you can personalize and share online." },
      { q: "Where can I share the bouquet?", a: "You can share the link on WhatsApp, text, email, or any messaging app." },
    ],
  },
  "/virtual-bouquet-maker-free": {
    title: "Virtual Bouquet Maker Free",
    seoTitle: "Virtual Bouquet Maker Free | Create and Share Online",
    description:
      "Try a virtual bouquet maker free. Design a custom bouquet, add your note, and share it instantly without complicated setup.",
    keywords: [
      "virtual bouquet maker free",
      "free virtual bouquet maker",
      "virtual flower maker free",
      "online bouquet maker free",
    ],
    intro:
      "A free virtual bouquet maker experience with clean design, fast flow, and instant share links for meaningful moments.",
    faq: [
      { q: "Is there any subscription?", a: "No subscription is required to create and share bouquets." },
      { q: "Can I use this on mobile?", a: "Yes. The bouquet builder and shared bouquet pages are mobile-friendly." },
    ],
  },
  "/digital-bouquet-maker": {
    title: "Digital Bouquet Maker",
    seoTitle: "Digital Bouquet Maker | Personalized Flower Messages",
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
    faq: [
      { q: "Can I make a digital bouquet for birthdays?", a: "Yes. Birthday, apology, anniversary, and thank-you use cases are supported." },
      { q: "Can I preview before sharing?", a: "Yes. You can preview your bouquet and message before sending." },
    ],
  },
  "/digital-bouquet-maker-online-free": {
    title: "Digital Bouquet Maker Online Free",
    seoTitle: "Digital Bouquet Maker Online Free | Fast Share Link",
    description:
      "Create a digital bouquet maker online free experience in minutes. Choose flowers, write your message, and share instantly.",
    keywords: [
      "digital bouquet maker online free",
      "digital bouquet online free",
      "free digital bouquet maker",
      "digital flower gift free",
    ],
    intro:
      "For people searching digital bouquet maker online free, this page gives an easy builder plus instant sharing.",
    faq: [
      { q: "Is this digital bouquet maker really free to use?", a: "Yes. You can create and send bouquets without signup or subscription." },
      { q: "Can I send it internationally?", a: "Yes. The bouquet link works globally on any modern browser." },
    ],
  },
  "/digital-flower-bouquet-maker": {
    title: "Digital Flower Bouquet Maker",
    seoTitle: "Digital Flower Bouquet Maker | Build Online in Minutes",
    description:
      "Use a digital flower bouquet maker to create beautiful online flower arrangements and pair them with personal notes.",
    keywords: [
      "digital flower bouquet maker",
      "digital bouquet maker",
      "online flower bouquet maker",
      "flower bouquet maker online",
    ],
    intro:
      "This digital flower bouquet maker is optimized for fast creation, heartfelt notes, and instant delivery by link.",
    faq: [
      { q: "Do I need design skills?", a: "No design skills needed. Pick flowers, place them, and share." },
      { q: "Can I include both flowers and note?", a: "Yes. Your shared bouquet can include arranged flowers and a custom note." },
    ],
  },
  "/digital-flower-bouquet": {
    title: "Digital Flower Bouquet",
    seoTitle: "Digital Flower Bouquet | Create and Send Online",
    description:
      "Create a digital flower bouquet online and send it with a personal message. Quick builder, beautiful output, instant share.",
    keywords: [
      "digital flower bouquet",
      "digital flowers online",
      "send digital flower bouquet",
      "digital bouquet",
    ],
    intro:
      "A digital flower bouquet page designed for quick, emotional gifting when timing and message both matter.",
    faq: [
      { q: "How do I send a digital flower bouquet?", a: "Create your bouquet, copy the generated link, and send it to the recipient." },
      { q: "Will recipients see my note?", a: "Yes. Your note appears on the receiver page alongside the bouquet." },
    ],
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
    faq: [
      { q: "Is this an online flower bouquet maker?", a: "Yes. You can arrange flowers directly in your browser." },
      { q: "Can I share through WhatsApp?", a: "Yes. A shareable link is generated and can be sent via WhatsApp or other apps." },
    ],
  },
  "/bouquet-maker": {
    title: "Bouquet Maker",
    seoTitle: "Bouquet Maker | Build and Share a Digital Bouquet",
    description:
      "Try our bouquet maker to create personalized digital flower arrangements with message cards and instant share links.",
    keywords: [
      "bouquet maker",
      "bouquet creator",
      "digital bouquet maker",
      "online bouquet maker",
    ],
    intro:
      "A bouquet maker focused on emotional gifting: beautiful flowers, thoughtful notes, and quick sharing.",
    faq: [
      { q: "What can I customize in this bouquet maker?", a: "You can pick stems, arrange bouquet layout, and add a personal note." },
      { q: "Can I use it for apologies or anniversaries?", a: "Yes. It works for birthdays, apologies, anniversaries, and everyday surprises." },
    ],
  },
  "/bouquet-maker-online": {
    title: "Bouquet Maker Online",
    seoTitle: "Bouquet Maker Online | Digital Flowers with Note",
    description:
      "Use this bouquet maker online to create flower arrangements with notes and share instantly with one link.",
    keywords: [
      "bouquet maker online",
      "online bouquet maker",
      "online flower bouquet maker",
      "bouquet with note",
    ],
    intro:
      "A bouquet maker online flow built for speed and quality on both desktop and mobile.",
    faq: [
      { q: "Does bouquet maker online work on phone?", a: "Yes. It is fully responsive and works well on mobile browsers." },
      { q: "How long does creation take?", a: "Most users finish and share in under two minutes." },
    ],
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
    faq: [
      { q: "Can I send this within the USA instantly?", a: "Yes. Delivery is instant by share link, no physical shipping required." },
      { q: "Is this suitable for long-distance gifting?", a: "Yes. It is designed for fast long-distance gifting moments." },
    ],
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
    faq: [
      { q: "Does this work for UK users?", a: "Yes. This page is tailored for UK search intent and audiences." },
      { q: "Can I personalize the note?", a: "Yes. Every bouquet can carry a personalized message." },
    ],
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
    faq: [
      { q: "Is this available in Canada?", a: "Yes. Canadian users can create and share bouquets with the same flow." },
      { q: "Is payment required to create?", a: "You can create and preview bouquets without signup." },
    ],
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
    faq: [
      { q: "Can Australians use this on mobile?", a: "Yes. The full experience is mobile-friendly." },
      { q: "Can I send for birthdays and anniversaries?", a: "Yes. It supports all common gifting occasions." },
    ],
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
      alternates: countryAlternates,
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

        <article className="mt-4 rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Popular searches this page answers
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            {page.keywords.join(" • ")}
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
          <Link to="/virtual-bouquet-maker-online-free" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Virtual Maker Free
          </Link>
          <Link to="/digital-bouquet-maker-online-free" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Digital Maker Free
          </Link>
          <Link to="/digital-flower-bouquet-maker" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Digital Flower Maker
          </Link>
          <Link to="/bouquet-maker-online" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-stone-700 hover:border-stone-300">
            Bouquet Maker Online
          </Link>
        </div>
      </section>
    </main>
  );
}
