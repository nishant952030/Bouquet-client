import MothersDayLanding from "../../src/components/MothersDayLanding";

export const metadata = {
  title: "Mother's Day Digital Gift | Free Card, Bouquet & Hug",
  description:
    "Give Mom the perfect free digital gift this Mother's Day. Choose from interactive cards, virtual flower bouquets, or a pull-to-open hug card. No shipping, no cost — just love.",
  keywords: "mothers day digital gift free, free online gift for mom, digital mothers day present, virtual gift for mother, last minute mothers day gift",
  alternates: { canonical: "https://www.petalsandwords.com/mothers-day-digital-gift" },
  openGraph: {
    title: "Mother's Day Digital Gift | Free Card, Bouquet & Hug",
    description: "Free digital gifts for Mom — interactive card, virtual bouquet, or hug. No shipping needed.",
    url: "https://www.petalsandwords.com/mothers-day-digital-gift",
    siteName: "Petals and Words",
  },
};

const CONTENT = {
  title: "Free Digital Gift for Mother's Day",
  seoTitle: "Mother's Day Digital Gift | Free Card, Bouquet & Hug",
  description:
    "Give Mom the perfect free digital gift this Mother's Day. Choose from interactive cards, virtual flower bouquets, or a pull-to-open hug card. No shipping, no cost — just love.",
  intro:
    "Forgot to buy a gift? No worries! Create a stunning digital gift for Mom in under 2 minutes — a personalized card, a beautiful virtual bouquet, or an interactive hug. It's free, instant, and straight from the heart.",
  faq: [
    {
      q: "What digital gifts can I give Mom?",
      a: "You can create a 3D interactive Mother's Day card with envelope reveal, a virtual flower bouquet with a personal note, or a pull-to-open hug card with an animation.",
    },
    {
      q: "Is this really a last-minute gift?",
      a: "Yes! All digital gifts are created and shared instantly via a link. There's no shipping, no printing — Mom can open her gift within seconds of you sending it.",
    },
    {
      q: "Can I personalize the message?",
      a: "Absolutely. You write the message yourself or choose from emotion-driven templates. The gift is as personal as you make it.",
    },
    {
      q: "How does she open the gift?",
      a: "She clicks or taps the link you share. The gift opens in her browser with a beautiful animation — no app download required.",
    },
  ],
};

export default function Page() {
  return <MothersDayLanding content={CONTENT} slug="mothers-day-digital-gift" />;
}
