import LegacyAppShell from "../[...slug]/LegacyAppShell";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Create a Free Digital Bouquet | Pick Flowers & Add a Note | Petals & Words",
  description:
    "Build a custom digital bouquet with roses, tulips, sunflowers, and more. Write a personal note and share instantly via WhatsApp. Free, no signup required.",
  keywords:
    "create digital bouquet, free bouquet maker, bouquet with note, digital flowers, flower gift online",
  alternates: { canonical: `${BASE_URL}/create` },
  openGraph: {
    title: "Create a Free Digital Bouquet | Pick Flowers & Add a Note",
    description:
      "Build a custom digital bouquet with roses, tulips, sunflowers, and more. Write a personal note and share instantly.",
    url: `${BASE_URL}/create`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Free Digital Bouquet | Pick Flowers & Add a Note",
    description:
      "Build a custom digital bouquet and share instantly via WhatsApp. Free, no signup.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};


export default function CreatePage() {
  return <LegacyAppShell />;
}
