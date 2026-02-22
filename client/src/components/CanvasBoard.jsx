import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricText } from "fabric";
import { getCleanFlowerImageSrc } from "../lib/flowerImage";

const MAX_CANVAS_WIDTH = 340;
const MIN_CANVAS_WIDTH = 250;
const CANVAS_RATIO = 440 / 340;
const CANVAS_STATE_STORAGE_KEY = "bouquet_canvas_state_v1";

function readStoredStems() {
  try {
    const raw = localStorage.getItem(CANVAS_STATE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read canvas state", error);
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
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: Math.round(320 * CANVAS_RATIO) });
  const [canRemoveSelected, setCanRemoveSelected] = useState(false);
  const [canRaiseSelected, setCanRaiseSelected] = useState(false);
  const selectedFlowerRef = useRef(selectedFlower);

  useEffect(() => {
    selectedFlowerRef.current = selectedFlower;
  }, [selectedFlower]);

  const serializeStems = (canvas) => {
    return canvas
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
  };

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

  const loadStemImages = (canvas, stems) => {
    return Promise.all(
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
          .catch((error) => {
            console.error("Failed to load flower", error);
            return null;
          }),
      ),
    );
  };

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!wrapperRef.current) return;
      const available = wrapperRef.current.clientWidth - 24;
      const width = Math.max(MIN_CANVAS_WIDTH, Math.min(MAX_CANVAS_WIDTH, available));
      const height = Math.round(width * CANVAS_RATIO);
      setCanvasSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

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
      fontSize: 30,
      fontWeight: "700",
      angle: -24,
      opacity: 0.14,
      fill: "#7c2d12",
      selectable: false,
      evented: false,
    });
    const paymentMark = new FabricText("Payment required to remove watermark", {
      left: canvasSize.width / 2,
      top: canvasSize.height - 28,
      originX: "center",
      originY: "center",
      fontSize: 12,
      opacity: 0.5,
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
        const left = currentCanvas.width * 0.5 + Math.random() * 72 - 36;
        const top = currentCanvas.height * 0.58 + Math.random() * 80 - 40;
        const angle = Math.random() * 16 - 8;
        const stemId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        img.scaleToWidth(baseWidth);
        img.set({
          left,
          top,
          originX: "center",
          originY: "center",
          angle,
          cornerStyle: "circle",
          transparentCorners: false,
          flowerSrc: selectedFlower,
          stemId,
        });

        currentCanvas.add(img);
        currentCanvas.setActiveObject(img);
        watermarkObjects.current.forEach((item) => currentCanvas.bringObjectToFront(item));
        currentCanvas.renderAll();
        persistAndEmit(currentCanvas);
        updateRemoveState(currentCanvas);
      })
      .catch((error) => {
        console.error("Failed to load selected flower image", error);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedFlower, onCanvasStateChange]);

  useEffect(() => {
    if (!presetRequest?.id || !Array.isArray(presetRequest.stems) || !fabricCanvas.current) return;
    const currentCanvas = fabricCanvas.current;
    const removable = currentCanvas.getObjects().filter((item) => item.type === "image" && item.flowerSrc);
    removable.forEach((item) => currentCanvas.remove(item));

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
    if (!active || active.type !== "image" || !active.flowerSrc) return;
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
    const removable = canvas.getObjects().filter((item) => item.type === "image" && item.flowerSrc);
    removable.forEach((item) => canvas.remove(item));
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
    if (!active || active.type !== "image" || !active.flowerSrc) return;
    canvas.bringObjectForward(active);
    watermarkObjects.current.forEach((item) => canvas.bringObjectToFront(item));
    canvas.renderAll();
    persistAndEmit(canvas);
    updateRemoveState(canvas);
  };

  return (
    <div ref={wrapperRef} className="w-full max-w-[360px] rounded-[1.8rem] border border-amber-100 bg-white p-2.5 shadow-xl shadow-rose-200/40 sm:p-3">
      <canvas id="bouquet-canvas" ref={canvasRef} className="mx-auto rounded-[1.3rem]" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={raiseSelectedFlower}
          disabled={!canRaiseSelected}
          className={[
            "w-full rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition",
            canRaiseSelected ? "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100" : "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400",
          ].join(" ")}
        >
          Bring Forward
        </button>
        <button
          type="button"
          onClick={removeSelectedFlower}
          disabled={!canRemoveSelected}
          className={[
            "w-full rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition",
            canRemoveSelected ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400",
          ].join(" ")}
        >
          Remove Flower
        </button>
        <button
          type="button"
          onClick={clearCanvasFlowers}
          className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-800 transition hover:bg-amber-100"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
}
