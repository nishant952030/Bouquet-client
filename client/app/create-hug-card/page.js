import LegacyAppShell from "../[...slug]/LegacyAppShell";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Send a Virtual Hug Card | Free Interactive Pull-to-Open | Petals & Words",
  description:
    "Create a warm, interactive virtual hug card. Pull to open and reveal your heartfelt message. Free, instant sharing via WhatsApp, text, or email.",
  keywords:
    "virtual hug card, send virtual hug, interactive hug card online, free hug card maker, digital hug",
  alternates: { canonical: `${BASE_URL}/create-hug-card` },
  openGraph: {
    title: "Send a Virtual Hug Card | Free Interactive Pull-to-Open",
    description:
      "Create a warm, interactive virtual hug card with pull-to-open animation. Free and instant.",
    url: `${BASE_URL}/create-hug-card`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Send a Virtual Hug Card | Free Interactive Pull-to-Open",
    description:
      "Create a warm virtual hug card with pull-to-open animation. Free and instant.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};


export default function CreateHugCardPage() {
  return <LegacyAppShell />;
}
