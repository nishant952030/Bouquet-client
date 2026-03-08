import { useEffect, useState } from "react";
import { flowers } from "../data/flowerCatalog";
import { getCleanFlowerImageSrc } from "../lib/flowerImage";

export default function FlowerPicker({ onPick, selectedFlower, layout = "row" }) {
  const isColumn = layout === "column";
  const [cleanedSrcMap, setCleanedSrcMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(flowers.map(async (flower) => [flower.id, await getCleanFlowerImageSrc(flower.src)]))
      .then((entries) => {
        if (cancelled) return;
        setCleanedSrcMap(Object.fromEntries(entries));
      })
      .catch((error) => console.error("Failed to prepare clean flower previews", error));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🌸</span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Step 1</p>
          <p
            className="text-base font-light text-stone-800 leading-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Pick your stems
          </p>
        </div>
      </div>

      {flowers.length === 0 ? (
        <p className="text-sm text-stone-500">No flower assets found.</p>
      ) : (
        <div
          className={[
            "flex gap-2.5",
            isColumn
              ? "max-h-[340px] flex-col overflow-y-auto pr-1"
              : "overflow-x-auto overflow-y-hidden pb-2",
          ].join(" ")}
          style={{ scrollbarWidth: "none" }}
        >
          {flowers.map((flower) => {
            const displaySrc = cleanedSrcMap[flower.id] || flower.src;
            const isSelected = selectedFlower === displaySrc;

            return (
              <button
                key={flower.id}
                type="button"
                onClick={() => onPick(displaySrc)}
                aria-label={`Add ${flower.label}`}
                title={flower.label}
                className={[
                  "relative shrink-0 overflow-hidden rounded-xl border-2 bg-[#faf6f0] transition-all duration-150 active:scale-95",
                  isColumn ? "h-14 w-14" : "h-16 w-16",
                  isSelected
                    ? "border-[#c0605a] ring-2 ring-[#c0605a]/30 shadow-md"
                    : "border-rose-100 hover:border-rose-300 hover:-translate-y-0.5",
                ].join(" ")}
              >
                <img
                  src={displaySrc}
                  alt={flower.label}
                  className="h-full w-full object-contain p-1"
                  loading="lazy"
                />
                {isSelected && (
                  <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c0605a] text-[8px] text-white font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-2.5 text-[11px] text-stone-400 leading-relaxed">
        Tap a flower to place it on your canvas. Tap again to add more.
      </p>
    </div>
  );
}