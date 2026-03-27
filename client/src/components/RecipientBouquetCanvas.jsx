import { useEffect, useRef } from "react";
import { Canvas, FabricImage } from "fabric";
import { getCleanFlowerImageSrc } from "../lib/flowerImage";

const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 440;

export default function RecipientBouquetCanvas({ stems }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      selection: false,
    });
    canvas.backgroundColor = "#fff8f2";
    canvas.renderAll();

    const loadFlowers = async () => {
      const images = await Promise.all(
        stems.map(async (stem) => {
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
        }),
      );
      images.forEach((img) => canvas.add(img));
      canvas.renderAll();
    };

    loadFlowers().catch((error) => console.error("Failed to render bouquet for recipient", error));

    return () => canvas.dispose();
  }, [stems]);

  return (
    <div className="flex w-full items-center justify-center">
      <canvas ref={canvasRef} className="mx-auto block" />
    </div>
  );
}
