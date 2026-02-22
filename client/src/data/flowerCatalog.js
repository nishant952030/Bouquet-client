const flowerModules = import.meta.glob("../assets/flowers/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

export const flowers = Object.entries(flowerModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src], index) => ({
    id: path,
    src,
    label: `Flower ${index + 1}`,
  }));
