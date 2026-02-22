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
      .catch((error) => {
        console.error("Failed to prepare clean flower previews", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-4 rounded-3xl border border-rose-200/70 bg-white/70 p-3.5 shadow-lg backdrop-blur sm:mt-5 sm:p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-rose-700 sm:text-sm">Pick stems</p>

      {flowers.length === 0 ? (
        <p className="text-sm text-stone-500">No flower assets found in src/assets/flowers.</p>
      ) : (
        <div
          className={[
            "flex gap-2.5 pb-1 sm:gap-3",
            isColumn
              ? "max-h-[360px] flex-col overflow-y-auto overflow-x-hidden pr-1"
              : "overflow-x-auto overflow-y-hidden",
          ].join(" ")}
        >
          {flowers.map((flower) => {
            const displaySrc = cleanedSrcMap[flower.id] || flower.src;
            const isSelected = selectedFlower === displaySrc;

            return (
              <button
                key={flower.id}
                type="button"
                onClick={() => onPick(displaySrc)}
                className={[
                  "group relative shrink-0 overflow-hidden border-2 bg-white shadow transition",
                  isColumn ? "h-12 w-12 rounded-xl sm:h-14 sm:w-14" : "h-14 w-14 rounded-xl sm:h-16 sm:w-16 sm:rounded-2xl",
                  isSelected
                    ? "border-rose-500 ring-2 ring-rose-300"
                    : "border-rose-100 hover:-translate-y-0.5 hover:border-rose-300",
                ].join(" ")}
                aria-label={`Add ${flower.label}`}
                title={flower.label}
              >
                <img src={displaySrc} alt={flower.label} className="h-full w-full object-contain" loading="lazy" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
