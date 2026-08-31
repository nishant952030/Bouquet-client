import HomeClient from "./home-client";
import { getHomepageSchema } from "../src/lib/seoSchemas";

export const metadata = {
  title: "Free Online Bouquet Maker | Create & Send Digital Flowers with a Note",
  description: "Send a digital bouquet for birthdays, Father's Day, anniversaries, or just because. Free, instant, no signup. The easiest way to show someone you care.",
  alternates: {
    canonical: "https://www.petalsandwords.com",
  },
};

export default function Page() {
  const homepageSchema = getHomepageSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageSchema),
        }}
      />
      <HomeClient />
    </>
  );
}
