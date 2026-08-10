import CreatePetClient from "./CreatePetClient";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Adopt a Virtual Pet Gift | Interactive Digital Puppy | Petals & Words",
  description:
    "Adopt a virtual pet for your loved one. They must feed it, play with it, and keep it happy! A unique, interactive digital gift experience.",
  keywords:
    "virtual pet gift, adopt digital pet, interactive pet gift, virtual puppy gift, digital pet adoption",
  alternates: { canonical: `${BASE_URL}/create-pet` },
  openGraph: {
    title: "Adopt a Virtual Pet Gift | Interactive Digital Puppy",
    description:
      "Adopt a virtual pet for your loved one. They must feed it, play with it, and keep it happy!",
    url: `${BASE_URL}/create-pet`,
    siteName: "Petals & Words",
    type: "website",
    images: [{ url: `${BASE_URL}/logo-transparent.png`, width: 512, height: 512, alt: "Petals & Words" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adopt a Virtual Pet Gift | Interactive Digital Puppy",
    description:
      "Adopt a virtual pet for your loved one. Feed it, play with it, keep it happy!",
    images: [`${BASE_URL}/logo-transparent.png`],
  },
};

export default function CreatePetPage() {
  return <CreatePetClient />;
}
