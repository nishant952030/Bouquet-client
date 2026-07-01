import MothersDayLanding from "../../src/components/MothersDayLanding";

export const metadata = {
  title: "Interactive Mother's Day Card | Free Online Card Maker",
  description:
    "Create a stunning interactive Mother's Day card with envelope reveal animation, custom textures, and stickers. Free, instant, and beautiful on any device.",
  keywords: "interactive mothers day card, animated mothers day card online, mothers day card with animation free, digital interactive card for mom",
  alternates: { canonical: "https://www.petalsandwords.com/interactive-mothers-day-card" },
  openGraph: {
    title: "Interactive Mother's Day Card | Free Online Card Maker",
    description: "Envelope reveal, custom textures, emoji stickers. The most beautiful free card for Mom.",
    url: "https://www.petalsandwords.com/interactive-mothers-day-card",
    siteName: "Petals and Words",
  },
};

const CONTENT = {
  title: "Interactive Mother's Day Card",
  seoTitle: "Interactive Mother's Day Card | Free Online Card Maker",
  description:
    "Create a stunning interactive Mother's Day card with envelope reveal animation, custom textures, and stickers. Free, instant, and beautiful on any device.",
  intro:
    "Go beyond a plain digital card. Create a fully interactive Mother's Day experience — Mom taps an elegant envelope, it slides open with an animation, and reveals your personal letter. It feels like magic. And it's completely free.",
  faq: [
    {
      q: "What makes this card interactive?",
      a: "The card features a 3D envelope that the recipient taps or clicks to open. It slides apart with a smooth CSS animation, revealing your handwritten-style letter inside.",
    },
    {
      q: "Can I choose different card designs?",
      a: "Yes! Choose from beautiful paper textures including Blush Rose, Warm Gold, Cream Linen, and Lavender Dream. Add emoji sticker decorations to the envelope.",
    },
    {
      q: "How long does it take to make?",
      a: "Under 2 minutes. Choose your design, type your message, preview it, and share the link. That's it.",
    },
    {
      q: "Will it look good on Mom's phone?",
      a: "Yes. The card is fully responsive and optimized for mobile. It looks stunning on iPhone, Android, tablets, and desktop computers.",
    },
  ],
};

export default function Page() {
  return <MothersDayLanding content={CONTENT} slug="interactive-mothers-day-card" />;
}
