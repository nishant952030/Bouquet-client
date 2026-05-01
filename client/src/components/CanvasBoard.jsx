import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Canvas, FabricImage } from "fabric";
import { getCleanFlowerImageSrc } from "../lib/flowerImage";

const MAX_CANVAS_WIDTH = 340;
const MIN_CANVAS_WIDTH = 260;
const CANVAS_RATIO = 440 / 340;
const CANVAS_STATE_STORAGE_KEY = "bouquet_canvas_state_v1";

function writeStoredStems(stems) {
  try {
    localStorage.setItem(CANVAS_STATE_STORAGE_KEY, JSON.stringify(stems));
  } catch (error) {
    console.error("Failed to store canvas state", error);
  }
}

export default function CanvasBoard({ selectedFlower, onCanvasStateChange, presetRequest }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fabricCanvas = useRef(null);

  const [canvasSize, setCanvasSize] = useState({ width: 300, height: Math.round(300 * CANVAS_RATIO) });
  const [canRemoveSelected, setCanRemoveSelected] = useState(false);
  const [canRaiseSelected, setCanRaiseSelected] = useState(false);

  const serializeStems = (canvas) =>
    canvas
      .getObjects()
      .filter((item) => item.type === "image" && item.flowerSrc)
      .map((item, index) => ({
        stemId: item.stemId,
        src: item.flowerSrc,
        x: item.left / canvas.width,
        y: item.top / canvas.height,
        width: item.getScaledWidth() / canvas.width,
        angle: item.angle ?? 0,
        zIndex: index,
      }));

  const persistAndEmit = (canvas) => {
    const stems = serializeStems(canvas);
    writeStoredStems(stems);
    if (onCanvasStateChange) onCanvasStateChange(stems);
  };

  const updateRemoveState = (canvas) => {
    const active = canvas.getActiveObject();
    const isFlower = Boolean(active && active.type === "image" && active.flowerSrc);
    setCanRemoveSelected(isFlower);
    setCanRaiseSelected(isFlower);
  };

  const loadStemImages = (canvas, stems) =>
    Promise.all(
      stems.map((stem) =>
        getCleanFlowerImageSrc(stem.src)
          .then((cleanSrc) => FabricImage.fromURL(cleanSrc))
          .then((img) => {
            const width = Math.max(40, stem.width * canvas.width);
            img.scaleToWidth(width);
            img.set({
              left: stem.x * canvas.width,
              top: stem.y * canvas.height,
              originX: "center",
              originY: "center",
              angle: stem.angle ?? 0,
              cornerStyle: "circle",
              transparentCorners: false,
              cornerSize: 18,
              touchCornerSize: 28,
              padding: 8,
              flowerSrc: stem.src,
              stemId: stem.stemId ?? `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            });
            return img;
          })
          .catch(() => null),
      ),
    );

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!wrapperRef.current) return;
      const available = wrapperRef.current.clientWidth - 8;
      const width = Math.max(MIN_CANVAS_WIDTH, Math.min(MAX_CANVAS_WIDTH, available));
      const height = Math.round(width * CANVAS_RATIO);
      setCanvasSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const canvas = new Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      selection: false,
      preserveObjectStacking: true,
    });
    canvas.backgroundColor = "#fff8f2";
    canvas.targetFindTolerance = 10;

    canvas.renderAll();
    fabricCanvas.current = canvas;

    persistAndEmit(canvas);

    const onObjectModified = () => {

      canvas.renderAll();
      persistAndEmit(canvas);
      updateRemoveState(canvas);
    };
    const onSelectionChanged = () => updateRemoveState(canvas);
    const onKeyDown = (event) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const active = canvas.getActiveObject();
      if (!active || active.type !== "image" || !active.flowerSrc) return;
      canvas.remove(active);
      canvas.discardActiveObject();

      canvas.renderAll();
      persistAndEmit(canvas);
      updateRemoveState(canvas);
      event.preventDefault();
    };

    canvas.on("object:modified", onObjectModified);
    canvas.on("object:removed", onObjectModified);
    canvas.on("selection:created", onSelectionChanged);
    canvas.on("selection:updated", onSelectionChanged);
    canvas.on("selection:cleared", onSelectionChanged);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      canvas.off("object:modified", onObjectModified);
      canvas.off("object:removed", onObjectModified);
      canvas.off("selection:created", onSelectionChanged);
      canvas.off("selection:updated", onSelectionChanged);
      canvas.off("selection:cleared", onSelectionChanged);
      window.removeEventListener("keydown", onKeyDown);
      canvas.dispose();
      fabricCanvas.current = null;
    };
  }, [canvasSize.height, canvasSize.width, onCanvasStateChange]);

  useEffect(() => {
    if (!selectedFlower || !fabricCanvas.current) return;
    let cancelled = false;
    getCleanFlowerImageSrc(selectedFlower)
      .then((cleanSrc) => FabricImage.fromURL(cleanSrc))
      .then((img) => {
        if (cancelled || !fabricCanvas.current) return;
        const currentCanvas = fabricCanvas.current;
        const baseWidth = Math.max(70, currentCanvas.width * 0.25);
        img.scaleToWidth(baseWidth);
        img.set({
          left: currentCanvas.width * 0.5 + Math.random() * 60 - 30,
          top: currentCanvas.height * 0.58 + Math.random() * 70 - 35,
          originX: "center",
          originY: "center",
          angle: Math.random() * 16 - 8,
          cornerStyle: "circle",
          transparentCorners: false,
          cornerSize: 18,
          touchCornerSize: 28,
          padding: 8,
          flowerSrc: selectedFlower,
          stemId: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        });
        currentCanvas.add(img);
        currentCanvas.setActiveObject(img);

        currentCanvas.renderAll();
        persistAndEmit(currentCanvas);
        updateRemoveState(currentCanvas);
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [selectedFlower, onCanvasStateChange]);

  useEffect(() => {
    if (!presetRequest?.id || !Array.isArray(presetRequest.stems) || !fabricCanvas.current) return;
    const currentCanvas = fabricCanvas.current;
    currentCanvas.getObjects().filter((item) => item.type === "image" && item.flowerSrc).forEach((item) => currentCanvas.remove(item));
    const orderedStems = [...presetRequest.stems].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    loadStemImages(currentCanvas, orderedStems).then((images) => {
      images.filter(Boolean).forEach((img) => currentCanvas.add(img));

      currentCanvas.renderAll();
      persistAndEmit(currentCanvas);
      updateRemoveState(currentCanvas);
    });
  }, [presetRequest, onCanvasStateChange]);

  const removeSelectedFlower = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || !active.flowerSrc) return;
    canvas.remove(active);
    canvas.discardActiveObject();

    canvas.renderAll();
    persistAndEmit(canvas);
    updateRemoveState(canvas);
  };

  const clearCanvasFlowers = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    canvas.getObjects().filter((item) => item.type === "image" && item.flowerSrc).forEach((item) => canvas.remove(item));
    canvas.discardActiveObject();

    canvas.renderAll();
    persistAndEmit(canvas);
    updateRemoveState(canvas);
  };

  const raiseSelectedFlower = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || !active.flowerSrc) return;
    canvas.bringObjectForward(active);

    canvas.renderAll();
    persistAndEmit(canvas);
  };

  return (
    <div ref={wrapperRef} className="w-full">
      {/* Canvas wrapper â€” warm card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-rose-100 bg-[#fff8f2] shadow-lg shadow-rose-100/50"
        style={{ touchAction: "none" }}
      >
        <canvas ref={canvasRef} className="mx-auto block rounded-2xl" />
      </div>

      {/* Controls row â€” touch-friendly, 48px tall minimum */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={raiseSelectedFlower}
          disabled={!canRaiseSelected}
          className={[
            "flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-95",
            canRaiseSelected
              ? "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
              : "cursor-not-allowed border border-stone-100 bg-stone-50 text-stone-300",
          ].join(" ")}
        >
          <span className="text-base">{"\u2191"}</span>
          {t("create.canvasForward", "Forward")}
        </button>
        <button
          type="button"
          onClick={removeSelectedFlower}
          disabled={!canRemoveSelected}
          className={[
            "flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-95",
            canRemoveSelected
              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "cursor-not-allowed border border-stone-100 bg-stone-50 text-stone-300",
          ].join(" ")}
        >
          <span className="text-base">{"\u00D7"}</span>
          {t("create.canvasRemove", "Remove")}
        </button>
        <button
          type="button"
          onClick={clearCanvasFlowers}
          className="flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-800 transition-all hover:bg-amber-100 active:scale-95"
        >
          <span className="text-base">{"\u{1F5D1}"}</span>
          {t("create.canvasClear", "Clear")}
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] text-stone-400">
        {t("create.canvasHelpText", "Tap to select, drag to move, use corner handles to resize or rotate")}
      </p>
    </div>
  );
}


