const flowerModules = import.meta.glob("../assets/flowers/**/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

function titleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function parseMetaFromPath(path, index) {
  const match = path.match(/\/([^/]+)\.[^.]+$/);
  const filename = (match?.[1] || "").toLowerCase();
  const normalized = filename.replace(/[_-]+/g, " ").trim();
  const parts = normalized.split(" ").filter(Boolean);

  if (parts[0] === "flower") {
    return {
      type: "Mixed",
      label: `Flower ${index + 1}`,
    };
  }

  const type = titleCase(parts[0] || "Mixed");
  const numberPart = parts.find((part) => /^\d+$/.test(part));
  const label = numberPart ? `${type} ${numberPart}` : type;
  return { type, label };
}

export const flowers = Object.entries(flowerModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src], index) => {
    const meta = parseMetaFromPath(path, index);
    return {
      id: path,
      src,
      type: meta.type,
      label: meta.label,
    };
  });
