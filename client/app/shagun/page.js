import ShagunClient from "./ShagunClient";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Digital Shagun Envelope | Send Wedding & Eid Money Gifts Online | Petals & Words",
  description:
    "Create a digital shagun envelope for weddings, Eid, Diwali, or birthdays. Pay securely via Razorpay, get a printable QR card, and recipients claim directly to their UPI.",
  keywords:
    "digital shagun, online shagun, eidi online, digital envelope gift, send money gift online, wedding shagun online, digital cash gift",
  alternates: { canonical: `${BASE_URL}/shagun` },
  openGraph: {
    title: "Digital Shagun Envelope | Send Wedding & Eid Money Gifts Online",
    description:
      "Create a digital shagun envelope for weddings, Eid, Diwali, or birthdays. Pay securely and recipients claim via UPI.",
    url: `${BASE_URL}/shagun`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Shagun Envelope | Send Wedding & Eid Money Gifts Online",
    description:
      "Create a digital shagun envelope for weddings, Eid, Diwali. Pay securely, recipients claim via UPI.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};

export default function ShagunPage() {
  return <ShagunClient />;
}
