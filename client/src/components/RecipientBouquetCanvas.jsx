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
    <div className="w-full max-w-[360px]">
      {/* Decorative top label */}
      <div className="mb-2 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-200" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400">Your bouquet</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-200" />
      </div>

      {/* Canvas card */}
      <div className="overflow-hidden rounded-2xl border border-amber-100 bg-[#fff8f2] shadow-xl shadow-rose-100/40">
        <canvas id="recipient-bouquet-canvas" ref={canvasRef} className="mx-auto block" />
      </div>

      {/* Bottom flourish */}
      <p
        className="mt-3 text-center text-sm text-stone-400 italic"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        Made with love, just for you.
      </p>
    </div>
  );
}