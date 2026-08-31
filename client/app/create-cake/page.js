import LegacyAppShell from "../[...slug]/LegacyAppShell";
import { getCakeMakerSchema } from "../../src/lib/seoSchemas";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Virtual Birthday Cake Maker | Interactive 3D Cake with Candles | Petals & Words",
  description:
    "Create an interactive 3D birthday cake with blow-out candles. Customize flavors, add a birthday message, and share instantly. Free, no signup.",
  keywords:
    "virtual birthday cake, 3D cake maker online, interactive birthday cake, blow out candles online, digital birthday cake",
  alternates: { canonical: `${BASE_URL}/create-cake` },
  openGraph: {
    title: "Virtual Birthday Cake Maker | Interactive 3D Cake with Candles",
    description:
      "Create an interactive 3D birthday cake with blow-out candles. Customize and share instantly. Free.",
    url: `${BASE_URL}/create-cake`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Birthday Cake Maker | Interactive 3D Cake with Candles",
    description:
      "Create an interactive 3D birthday cake with blow-out candles. Free and instant.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};

export default function CreateCakePage() {
  const schema = getCakeMakerSchema();

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
