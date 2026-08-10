import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import ClientProviders from "./client-providers";

export const metadata = {
  metadataBase: new URL("https://www.petalsandwords.com"),
  title: {
    default: "Petals & Words | Send digital gifts that make people smile",
    template: "%s | Petals & Words",
  },
  description:
    "Create and send thoughtful digital bouquets, greetings, eidi, shagun, and virtual interactive gifts.",
  keywords:
    "digital bouquet, virtual flowers, online bouquet maker, digital greeting card, virtual gift",
  authors: [{ name: "Petals & Words", url: "https://www.petalsandwords.com" }],
  creator: "Petals & Words",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Petals & Words",
    images: [
      {
        url: "/logo-transparent.png",
        width: 512,
        height: 512,
        alt: "Petals & Words",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo-transparent.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Font domains for zero-render blocking on 3G/4G */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700;800&family=Noto+Serif:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Preload critical visual logo asset with fetchpriority="high" */}
        <link rel="preload" href="/logo-transparent.png" as="image" fetchPriority="high" />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
