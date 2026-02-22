import { useEffect, useRef } from "react";
import { Canvas, FabricImage } from "fabric";
import { getCleanFlowerImageSrc } from "../lib/flowerImage";

const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 440;

export default function RecipientBouquetCanvas({ stems }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new Canvas("recipient-bouquet-canvas", {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      selection: false,
    });
    canvas.backgroundColor = "#fff8f2";
    canvas.renderAll();

    const loadFlowers = async () => {
      const flowerPromises = stems.map(async (stem) => {
        const cleanSrc = await getCleanFlowerImageSrc(stem.src);
        const image = await FabricImage.fromURL(cleanSrc);
        const width = Math.max(40, stem.width * CANVAS_WIDTH);
        image.scaleToWidth(width);
        image.set({
          left: stem.x * CANVAS_WIDTH,
          top: stem.y * CANVAS_HEIGHT,
          originX: "center",
          originY: "center",
          angle: stem.angle,
          selectable: false,
          evented: false,
        });
        return image;
      });

      const images = await Promise.all(flowerPromises);
      images.forEach((image) => canvas.add(image));
      canvas.renderAll();
    };

    loadFlowers().catch((error) => {
      console.error("Failed to render bouquet for recipient", error);
    });

    return () => {
      canvas.dispose();
    };
  }, [stems]);

  return (
    <div className="w-full max-w-[360px] rounded-[1.8rem] border border-amber-100 bg-white p-2.5 shadow-xl shadow-rose-200/30 sm:p-3">
      <canvas id="recipient-bouquet-canvas" ref={canvasRef} className="mx-auto rounded-[1.3rem]" />
    </div>
  );
}
