import MothersDayLanding from "../../src/components/MothersDayLanding";

export const metadata = {
  title: "Best Virtual Mother's Day Card | Interactive & Free",
  description:
    "Design the perfect virtual Mother's Day card. Choose beautiful paper textures and emoji stickers. A memorable digital gift she can keep forever.",
  keywords: "virtual mothers day card free, custom mothers day card online, best free digital mothers day card, mothers day ecard free",
  alternates: { canonical: "https://www.petalsandwords.com/best-virtual-mothers-day-card" },
  openGraph: {
    title: "Best Virtual Mother's Day Card | Interactive & Free",
    description: "Design the perfect virtual Mother's Day card. Interactive envelope reveal, fully customizable, 100% free.",
    url: "https://www.petalsandwords.com/best-virtual-mothers-day-card",
    siteName: "Petals and Words",
  },
};

const CONTENT = {
  title: "The Best Virtual Mother's Day Card",
  seoTitle: "Best Virtual Mother's Day Card | Interactive & Free",
  description:
    "Design the perfect virtual Mother's Day card. Choose beautiful CSS paper textures and emoji stickers. A memorable digital gift that she can keep forever.",
  intro:
    "Physical cards get lost, but a beautiful virtual Mother's Day card lives on her phone forever. Create an interactive envelope-reveal card today — completely free, no account needed.",
  faq: [
    {
      q: "What makes this the best virtual card?",
      a: "Unlike static images or boring PDFs, our cards are fully interactive. Mom taps a beautifully rendered envelope, which slides open to reveal your personalized letter.",
    },
    {
      q: "Can I customize the look of the card?",
      a: "Yes! You can choose from elegant textures like Blush Rose, Warm Gold, or Lavender Dream, and decorate the edges with beautiful emoji stickers.",
    },
    {
      q: "Will this work on her mobile phone?",
      a: "Yes, the card is perfectly optimized for both mobile phones and desktop computers. It will look stunning no matter what device she uses.",
    },
    {
      q: "Is it really free?",
      a: "Completely free. No credit card, no account, no hidden fees. Create and share in under 2 minutes.",
    },
  ],
};

export default function Page() {
  return <MothersDayLanding content={CONTENT} slug="best-virtual-mothers-day-card" />;
}
