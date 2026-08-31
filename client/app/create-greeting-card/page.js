import LegacyAppShell from "../[...slug]/LegacyAppShell";
import { getGreetingCardSchema } from "../../src/lib/seoSchemas";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Free Digital Greeting Card Maker | Create & Send Online | Petals & Words",
  description:
    "Create a stunning interactive greeting card with envelope reveal animation, custom textures, and stickers. Free, instant, beautiful on any device.",
  keywords:
    "digital greeting card maker, free greeting card online, create greeting card, send greeting card online, interactive card maker",
  alternates: { canonical: `${BASE_URL}/create-greeting-card` },
  openGraph: {
    title: "Free Digital Greeting Card Maker | Create & Send Online",
    description:
      "Create stunning interactive greeting cards with envelope reveal animation. Free, instant, beautiful on any device.",
    url: `${BASE_URL}/create-greeting-card`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Digital Greeting Card Maker | Create & Send Online",
    description:
      "Create stunning interactive greeting cards with envelope reveal animation. Free and instant.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};

export default function CreateGreetingCardPage() {
  const schema = getGreetingCardSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
      <LegacyAppShell />
    </>
  );
}
