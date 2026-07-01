import { useEffect } from "react";
import PlushieConfigurator from "../components/plushie3d/PlushieConfigurator";
import { applySeo } from "../lib/seo";

export default function CreatePlushie() {
  useEffect(() => {
    applySeo({
      title: "Design a 3D Custom Plushie & Gift Box | Send Free",
      description: "Customize a virtual 3D plush bear, bunny or panda. Add accessories, place it in a gift box, write a sweet note, and share it instantly for free!",
      path: "/create-plushie"
    });
  }, []);

  return <PlushieConfigurator />;
}
