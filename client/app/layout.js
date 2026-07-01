import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import ClientProviders from "./client-providers";

export const metadata = {
  title: "Petals & Words | Send digital gifts that make people smile",
  description: "Create and send thoughtful digital bouquets, greetings, eidi, shagun, and virtual interactive gifts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
