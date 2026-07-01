import MothersDayLanding from "../../src/components/MothersDayLanding";

export const metadata = {
  title: "Send a Virtual Hug for Mother's Day | Free Interactive Hug Card",
  description:
    "Send Mom a free interactive virtual hug this Mother's Day. Our pull-to-open hug card features arms that unfold for a warm digital embrace. Share instantly via WhatsApp.",
  keywords: "send virtual hug mothers day, virtual hug for mom, mothers day hug card free, interactive hug card online, digital hug for mother",
  alternates: { canonical: "https://www.petalsandwords.com/send-virtual-hug-mothers-day" },
  openGraph: {
    title: "Send a Virtual Hug for Mother's Day | Free",
    description: "Interactive pull-to-open hug card with outstretched arms animation. Free and instant.",
    url: "https://www.petalsandwords.com/send-virtual-hug-mothers-day",
    siteName: "Petals and Words",
  },
};

const CONTENT = {
  title: "Send a Virtual Hug for Mother's Day",
  seoTitle: "Send a Virtual Hug for Mother's Day | Free Interactive Hug Card",
  description:
    "Send Mom a free interactive virtual hug this Mother's Day. Our pull-to-open hug card features arms that unfold for a warm digital embrace. Share instantly via WhatsApp.",
  intro:
    "When you can't be there in person, send a virtual hug that feels real. Our interactive pull-to-open hug card unfolds with arms reaching out for a warm embrace — the perfect surprise for Mom this Mother's Day.",
  faq: [
    {
      q: "How does the virtual hug card work?",
      a: "Tap or drag the card to open it. A cute figure with outstretched arms unfolds from the card, simulating a real paper craft hug. Hearts burst as the card opens!",
    },
    {
      q: "Can I send this hug via WhatsApp?",
      a: "Yes! Simply share the link via WhatsApp, iMessage, SMS, email, or any messaging app. Mom can open it instantly on her phone.",
    },
    {
      q: "Is this different from the Mother's Day card?",
      a: "Yes! The hug card is a fun, interactive pull-to-open card with a hug animation. We also offer a separate elegant Mother's Day card with an envelope-reveal effect.",
    },
    {
      q: "Is it free?",
      a: "Completely free. No account needed. Create and share your virtual hug in under 2 minutes.",
    },
  ],
};

export default function Page() {
  return <MothersDayLanding content={CONTENT} slug="send-virtual-hug-mothers-day" />;
}
