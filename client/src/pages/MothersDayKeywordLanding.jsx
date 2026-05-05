import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SoftButton from "../components/SoftButton";
import { applySeo } from "../lib/seo";

const MD_LANDING_CONTENT = {
  "/free-digital-mothers-day-card": {
    title: "Free Digital Mother's Day Card Maker",
    seoTitle: "Free Digital Mother's Day Card | Create & Send Online",
    description: "Create a beautiful, personalized, and interactive digital Mother's Day card for free. Customize the message, paper texture, and decorations. Send instantly via WhatsApp or email.",
    keywords: ["free digital mothers day card", "create mothers day card online", "personalized mothers day card free", "send mothers day card online"],
    intro: "Show your mom how much she means to you with a stunning, interactive 3D digital Mother's Day card. It's completely free to create and takes just seconds to share.",
    faq: [
      { q: "Is the digital Mother's Day card really free?", a: "Yes! Our digital Mother's Day card builder is 100% free to use. You can customize the message, background, and stickers, then share it without any hidden fees." },
      { q: "Can I add my own custom message?", a: "Absolutely. You can type your own heartfelt message, or choose from our curated list of emotional templates designed specifically for moms." },
      { q: "How do I send the card to my mom?", a: "Once you create your card, you'll receive a unique, secure link. You can instantly send this link to your mom via WhatsApp, Facebook Messenger, iMessage, SMS, or email." },
      { q: "Do I need to create an account?", a: "No account or signup is required. You can build and send your digital card immediately." }
    ],
  },
  "/best-virtual-mothers-day-card": {
    title: "The Best Virtual Mother's Day Card",
    seoTitle: "Best Virtual Mother's Day Card | Interactive & Free",
    description: "Design the perfect virtual Mother's Day card. Choose beautiful CSS paper textures and emoji stickers. A memorable digital gift that she can keep forever.",
    keywords: ["virtual mothers day card free", "custom mothers day card online", "best free digital mothers day card", "mothers day ecard free"],
    intro: "Physical cards get lost, but a beautiful virtual Mother's Day card lives on her phone forever. Create an interactive envelope-reveal card today.",
    faq: [
      { q: "What makes this the best virtual card?", a: "Unlike static images or boring PDFs, our cards are fully interactive. Mom taps a beautifully rendered envelope, which slides open to reveal your personalized letter." },
      { q: "Can I customize the look of the card?", a: "Yes! You can choose from elegant textures like Blush Rose, Warm Gold, or Lavender Dream, and decorate the edges with beautiful emoji stickers." },
      { q: "Will this work on her mobile phone?", a: "Yes, the card is perfectly optimized for both mobile phones and desktop computers. It will look stunning no matter what device she uses." },
    ],
  }
};

export default function MothersDayKeywordLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = useMemo(() => MD_LANDING_CONTENT[location.pathname] ?? MD_LANDING_CONTENT["/free-digital-mothers-day-card"], [location.pathname]);

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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-e91e63">Petals and Words 💌</p>
        <h1 className="mt-2 text-4xl text-stone-900 sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-700">{page.intro}</p>

        <div className="mt-7">
          <SoftButton text="Create Mom's Card Now" onClick={() => navigate("/create-mothers-day-card")} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
            <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Why Choose a Digital Card?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              A digital card is instant, eco-friendly, and interactive. You can create it at the very last minute and it arrives the second you hit send. No postage, no delays!
            </p>
          </article>

          <article className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
            <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              Fully Personalized
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              Don't settle for generic store-bought text. Pour your heart out in a custom message, and frame it with her favorite colors and beautiful floral stickers.
            </p>
          </article>
        </div>

        <article className="mt-4 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Instant WhatsApp & Messenger Sharing
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Once you finish designing, we generate a highly secure, base64-encoded link. Paste this into your WhatsApp chat, and she can tap it to instantly watch the interactive envelope reveal animation.
          </p>
        </article>

        <article className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Frequently Asked Questions
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
          <Link to="/create-mothers-day-card" className="rounded-full border border-pink-200 bg-white px-4 py-2 text-pink-700 hover:border-pink-300">
            Build a Card
          </Link>
          <Link to="/create" className="rounded-full border border-rose-200 bg-white px-4 py-2 text-rose-700 hover:border-rose-300">
            Build a Bouquet
          </Link>
        </div>
      </section>
    </main>
  );
}
