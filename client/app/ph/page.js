import LegacyAppShell from "../[...slug]/LegacyAppShell";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Libreng Digital Bouquet Maker sa Pilipinas | Petals & Words",
  description:
    "Gumawa ng magandang digital bouquet, greeting card, o 3D cake para sa iyong minamahal sa Pilipinas. 100% Libre, walang app download, share agad sa Messenger o WhatsApp!",
  keywords:
    "digital bouquet maker philippines, virtual bouquet tagalog, online bulaklak regalo, monthsary gift online, flowers para kay nanay, send flowers philippines online",
  alternates: { canonical: `${BASE_URL}/ph` },
  openGraph: {
    title: "Libreng Digital Bouquet Maker sa Pilipinas | Petals & Words",
    description:
      "Gumawa ng magandang digital bouquet, greeting card, o 3D cake para sa iyong minamahal sa Pilipinas. 100% Libre, share agad sa Messenger o WhatsApp!",
    url: `${BASE_URL}/ph`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Libreng Digital Bouquet Maker sa Pilipinas | Petals & Words",
    description:
      "Gumawa ng magandang digital bouquet at i-share agad sa Messenger o WhatsApp! 100% Libre.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};

export default function PhilippinesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Libreng Digital Bouquet Maker sa Pilipinas",
        url: `${BASE_URL}/ph`,
        description:
          "Gumawa ng magandang digital bouquet, greeting card, o 3D cake para sa iyong minamahal sa Pilipinas. 100% Libre.",
        inLanguage: ["tl", "en"],
        isPartOf: { "@type": "WebSite", name: "Petals & Words", url: BASE_URL },
      },
      {
        "@type": "SoftwareApplication",
        name: "Petals & Words Philippines Digital Bouquet Maker",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "PHP" },
        areaServed: ["PH"],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Libre ba gumawa ng bouquet para sa Pilipinas?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oo! 100% libreng gumawa, maglagay ng personal note, at i-share ang bouquet link sa Messenger, Viber, o WhatsApp.",
            },
          },
          {
            "@type": "Question",
            name: "Kailangan ba mag-download ng app?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Hindi. Direktang nagbubukas ang bouquet sa browser ng recipient sa kahit anong phone o computer.",
            },
          },
        ],
      },
    ],
  };

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
