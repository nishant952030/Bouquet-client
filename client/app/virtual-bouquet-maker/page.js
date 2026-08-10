import LegacyAppShell from "../[...slug]/LegacyAppShell";

const BASE_URL = "https://www.petalsandwords.com";

// Server-rendered metadata for SEO — this is what Google indexes
export const metadata = {
  title: "Virtual Bouquet Maker Online | Free Digital Flower Builder | Petals & Words",
  description:
    "Create a virtual bouquet online, add a heartfelt note, and share a beautiful flower gift instantly with one link. 100% free, no signup required.",
  keywords:
    "virtual bouquet maker, virtual flower bouquet maker online free, virtual flower maker, digital bouquet maker, online bouquet maker",
  alternates: { canonical: `${BASE_URL}/virtual-bouquet-maker` },
  openGraph: {
    title: "Virtual Bouquet Maker Online | Free Digital Flower Builder",
    description:
      "Create a virtual bouquet online, add a heartfelt note, and share a beautiful flower gift instantly with one link.",
    url: `${BASE_URL}/virtual-bouquet-maker`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Bouquet Maker Online | Free Digital Flower Builder",
    description:
      "Create a virtual bouquet online, add a heartfelt note, and share a beautiful flower gift instantly with one link.",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};


export default function VirtualBouquetMakerPage() {
  return (
    <>
      {/* JSON-LD structured data rendered server-side for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                name: "Virtual Bouquet Maker Online | Free Digital Flower Builder",
                url: `${BASE_URL}/virtual-bouquet-maker`,
                description:
                  "Create a virtual bouquet online, add a heartfelt note, and share a beautiful flower gift instantly with one link.",
                inLanguage: "en",
                isPartOf: { "@type": "WebSite", name: "Petals & Words", url: BASE_URL },
              },
              {
                "@type": "SoftwareApplication",
                name: "Petals & Words Virtual Bouquet Maker",
                applicationCategory: "LifestyleApplication",
                operatingSystem: "Web",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Is this bouquet maker free?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. You can create a digital bouquet and share it online without signing up.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I add a personal note?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. Each bouquet can include a custom note before you share the link.",
                    },
                  },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Virtual Bouquet Maker",
                    item: `${BASE_URL}/virtual-bouquet-maker`,
                  },
                ],
              },
            ],
          }),
        }}
      />
      <LegacyAppShell />
    </>
  );
}
