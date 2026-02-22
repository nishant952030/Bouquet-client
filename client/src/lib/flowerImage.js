const cleanedImageCache = new Map();

function isBackgroundPixel(r, g, b, a) {
  if (a < 8) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const channelSpread = max - min;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return channelSpread < 10 && luminance > 165;
}

export async function getCleanFlowerImageSrc(src) {
  if (!src) return src;
  if (cleanedImageCache.has(src)) return cleanedImageCache.get(src);

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (isBackgroundPixel(r, g, b, a)) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        console.error("Failed to clean flower image", error);
        resolve(src);
      }
    };

    image.onerror = () => resolve(src);
    image.src = src;
  });

  cleanedImageCache.set(src, promise);
  return promise;
}
