import MothersDayLanding from "../../src/components/MothersDayLanding";

export const metadata = {
  title: "Free Digital Mother's Day Card | Create & Send Online",
  description:
    "Create a beautiful, personalized, and interactive digital Mother's Day card for free. Customize the message, paper texture, and decorations. Send instantly via WhatsApp or email.",
  keywords: "free digital mothers day card, create mothers day card online, personalized mothers day card free, send mothers day card online",
  alternates: { canonical: "https://www.petalsandwords.com/free-digital-mothers-day-card" },
  openGraph: {
    title: "Free Digital Mother's Day Card | Create & Send Online",
    description: "Create a beautiful, personalized digital Mother's Day card for free. Send via WhatsApp in seconds.",
    url: "https://www.petalsandwords.com/free-digital-mothers-day-card",
    siteName: "Petals and Words",
  },
};

const CONTENT = {
  title: "Free Digital Mother's Day Card Maker",
  seoTitle: "Free Digital Mother's Day Card | Create & Send Online",
  description:
    "Create a beautiful, personalized, and interactive digital Mother's Day card for free. Customize the message, paper texture, and decorations. Send instantly via WhatsApp or email.",
  intro:
    "Show your mom how much she means to you with a stunning, interactive 3D digital Mother's Day card. It's completely free to create and takes just seconds to share via WhatsApp, iMessage, or email.",
  faq: [
    {
      q: "Is the digital Mother's Day card really free?",
      a: "Yes! Our digital Mother's Day card builder is 100% free to use. You can customize the message, background, and stickers, then share it without any hidden fees.",
    },
    {
      q: "Can I add my own custom message?",
      a: "Absolutely. You can type your own heartfelt message, or choose from our curated list of emotional templates designed specifically for moms.",
    },
    {
      q: "How do I send the card to my mom?",
      a: "Once you create your card, you'll receive a unique, secure link. You can instantly send this link to your mom via WhatsApp, Facebook Messenger, iMessage, SMS, or email.",
    },
    {
      q: "Do I need to create an account?",
      a: "No account or signup is required. You can build and send your digital card immediately.",
    },
  ],
};

export default function Page() {
  return <MothersDayLanding content={CONTENT} slug="free-digital-mothers-day-card" />;
}
