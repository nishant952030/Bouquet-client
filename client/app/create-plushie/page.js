import LegacyAppShell from "../[...slug]/LegacyAppShell";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Create a Virtual Plushie Gift | Cute Digital Stuffed Animal | Petals & Words",
  description:
    "Send a cute virtual plushie gift to someone special. Choose your stuffed animal, add a heartfelt message, and share instantly. Free, no signup.",
  keywords:
    "virtual plushie gift, digital stuffed animal, cute online gift, send plushie online, virtual teddy bear",
  alternates: { canonical: `${BASE_URL}/create-plushie` },
  openGraph: {
    title: "Create a Virtual Plushie Gift | Cute Digital Stuffed Animal",
    description:
      "Send a cute virtual plushie gift to someone special. Choose, customize, and share instantly. Free.",
    url: `${BASE_URL}/create-plushie`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Virtual Plushie Gift | Cute Digital Stuffed Animal",
    description:
      "Send a cute virtual plushie gift. Choose, customize, and share instantly. Free.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};


export default function CreatePlushiePage() {
  return <LegacyAppShell />;
}
