import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricText } from "fabric";
import { getCleanFlowerImageSrc } from "../lib/flowerImage";

const MAX_CANVAS_WIDTH = 340;
const MIN_CANVAS_WIDTH = 260;
const CANVAS_RATIO = 440 / 340;
const CANVAS_STATE_STORAGE_KEY = "bouquet_canvas_state_v1";

function readStoredStems() {
  try {
    const raw = localStorage.getItem(CANVAS_STATE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredStems(stems) {
  try {
    localStorage.setItem(CANVAS_STATE_STORAGE_KEY, JSON.stringify(stems));
  } catch (error) {
    console.error("Failed to store canvas state", error);
  }
}

export default function CanvasBoard({ selectedFlower, onCanvasStateChange, presetRequest }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fabricCanvas = useRef(null);
  const watermarkObjects = useRef([]);
  const activationTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: Math.round(300 * CANVAS_RATIO) });
  const [canRemoveSelected, setCanRemoveSelected] = useState(false);
  const [canRaiseSelected, setCanRaiseSelected] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isCanvasActive, setIsCanvasActive] = useState(true);

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
              flowerSrc: stem.src,
              stemId: stem.stemId ?? `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            });
            return img;
          })
          .catch(() => null),
      ),
    );

  useEffect(() => {
    const coarsePointer = typeof window !== "undefined" && (window.matchMedia?.("(pointer: coarse)")?.matches || "ontouchstart" in window);
    setIsTouchDevice(Boolean(coarsePointer));
    setIsCanvasActive(!coarsePointer);
  }, []);

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

  useEffect(() => () => clearTimeout(activationTimerRef.current), []);

  useEffect(() => {
    const canvas = new Canvas("bouquet-canvas", {
      width: canvasSize.width,
      height: canvasSize.height,
      selection: false,
    });
    canvas.backgroundColor = "#fff8f2";

    const previewMark = new FabricText("BOUQUET PREVIEW", {
      left: canvasSize.width / 2,
      top: canvasSize.height / 2 - 14,
      originX: "center",
      originY: "center",
      fontSize: 28,
      fontWeight: "700",
      angle: -24,
      opacity: 0.12,
      fill: "#7c2d12",
      selectable: false,
      evented: false,
    });
    const paymentMark = new FabricText("Payment required to remove watermark", {
      left: canvasSize.width / 2,
      top: canvasSize.height - 22,
      originX: "center",
      originY: "center",
      fontSize: 11,
      opacity: 0.45,
      fill: "#9a3412",
      selectable: false,
      evented: false,
    });
    watermarkObjects.current = [previewMark, paymentMark];
    canvas.add(previewMark, paymentMark);
    canvas.renderAll();
    fabricCanvas.current = canvas;

    const storedStems = readStoredStems().sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    loadStemImages(canvas, storedStems).then((images) => {
      images.filter(Boolean).forEach((img) => canvas.add(img));
      watermarkObjects.current.forEach((item) => canvas.bringObjectToFront(item));
      canvas.renderAll();
      persistAndEmit(canvas);
    });

    const onObjectModified = () => {
      watermarkObjects.current.forEach((item) => canvas.bringObjectToFront(item));
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
      watermarkObjects.current.forEach((item) => canvas.bringObjectToFront(item));
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
          flowerSrc: selectedFlower,
          stemId: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        });
        currentCanvas.add(img);
        currentCanvas.setActiveObject(img);
        watermarkObjects.current.forEach((item) => currentCanvas.bringObjectToFront(item));
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
      watermarkObjects.current.forEach((item) => currentCanvas.bringObjectToFront(item));
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
    watermarkObjects.current.forEach((item) => canvas.bringObjectToFront(item));
    canvas.renderAll();
    persistAndEmit(canvas);
    updateRemoveState(canvas);
  };

  const clearCanvasFlowers = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    canvas.getObjects().filter((item) => item.type === "image" && item.flowerSrc).forEach((item) => canvas.remove(item));
    canvas.discardActiveObject();
    watermarkObjects.current.forEach((item) => canvas.bringObjectToFront(item));
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
    watermarkObjects.current.forEach((item) => canvas.bringObjectToFront(item));
    canvas.renderAll();
    persistAndEmit(canvas);
  };

  const deactivateCanvasTouchMode = () => {
    setIsCanvasActive(false);
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    updateRemoveState(canvas);
  };

  const handleOverlayTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    clearTimeout(activationTimerRef.current);
    activationTimerRef.current = setTimeout(() => {
      setIsCanvasActive(true);
    }, 160);
  };

  const handleOverlayTouchMove = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    if (dx > 8 || dy > 8) {
      clearTimeout(activationTimerRef.current);
    }
  };

  const clearOverlayActivationTimer = () => {
    clearTimeout(activationTimerRef.current);
  };

  return (
    <div ref={wrapperRef} className="w-full">
      {/* Canvas wrapper — warm card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-rose-100 bg-[#fff8f2] shadow-lg shadow-rose-100/50"
        style={{ touchAction: isTouchDevice && !isCanvasActive ? "pan-y" : "none" }}
      >
        <canvas
          id="bouquet-canvas"
          ref={canvasRef}
          className={["mx-auto block rounded-2xl", isTouchDevice && !isCanvasActive ? "pointer-events-none" : ""].join(" ")}
        />
        {isTouchDevice && !isCanvasActive && (
          <button
            type="button"
            onClick={() => setIsCanvasActive(true)}
            onTouchStart={handleOverlayTouchStart}
            onTouchMove={handleOverlayTouchMove}
            onTouchEnd={clearOverlayActivationTimer}
            onTouchCancel={clearOverlayActivationTimer}
            className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 px-4 text-center backdrop-blur-[0.5px]"
          >
            <span className="rounded-full border border-rose-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-rose-700">
              Hold or tap to edit bouquet
            </span>
          </button>
        )}
        {isTouchDevice && isCanvasActive && (
          <button
            type="button"
            onClick={deactivateCanvasTouchMode}
            className="absolute right-2 top-2 z-20 rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-700"
          >
            Done
          </button>
        )}
      </div>

      {/* Controls row — touch-friendly, 48px tall minimum */}
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
          <span className="text-base">↑</span>
          Forward
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
          <span className="text-base">✕</span>
          Remove
        </button>
        <button
          type="button"
          onClick={clearCanvasFlowers}
          className="flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-800 transition-all hover:bg-amber-100 active:scale-95"
        >
          <span className="text-base">🗑</span>
          Clear
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] text-stone-400">
        Tap a flower to select · drag to reposition
      </p>
    </div>
  );
}
