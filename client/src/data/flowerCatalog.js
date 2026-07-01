import hydrangea_1 from "../assets/flowers/hydrangea/hydrangea_1.png";
import rose_1 from "../assets/flowers/rose/rose_1.png";
import rose_2 from "../assets/flowers/rose/rose_2.png";
import rose_3 from "../assets/flowers/rose/rose_3.png";
import rose_4 from "../assets/flowers/rose/rose_4.png";
import rose_5 from "../assets/flowers/rose/rose_5.png";
import sunflower_1 from "../assets/flowers/sunflower/sunflower_1.png";
import tulip_1 from "../assets/flowers/tulip/tulip_1.png";
import tulip_deep_purple_4 from "../assets/flowers/tulip/tulip_deep_purple_4.png";
import tulip_lavender_1 from "../assets/flowers/tulip/tulip_lavender_1.png";
import tulip_lilac_2 from "../assets/flowers/tulip/tulip_lilac_2.png";
import tulip_mauve_5 from "../assets/flowers/tulip/tulip_mauve_5.png";
import tulip_plum_6 from "../assets/flowers/tulip/tulip_plum_6.png";
import tulip_violet_3 from "../assets/flowers/tulip/tulip_violet_3.png";

const flowerModules = {
  "../assets/flowers/hydrangea/hydrangea_1.png": hydrangea_1,
  "../assets/flowers/rose/rose_1.png": rose_1,
  "../assets/flowers/rose/rose_2.png": rose_2,
  "../assets/flowers/rose/rose_3.png": rose_3,
  "../assets/flowers/rose/rose_4.png": rose_4,
  "../assets/flowers/rose/rose_5.png": rose_5,
  "../assets/flowers/sunflower/sunflower_1.png": sunflower_1,
  "../assets/flowers/tulip/tulip_1.png": tulip_1,
  "../assets/flowers/tulip/tulip_deep_purple_4.png": tulip_deep_purple_4,
  "../assets/flowers/tulip/tulip_lavender_1.png": tulip_lavender_1,
  "../assets/flowers/tulip/tulip_lilac_2.png": tulip_lilac_2,
  "../assets/flowers/tulip/tulip_mauve_5.png": tulip_mauve_5,
  "../assets/flowers/tulip/tulip_plum_6.png": tulip_plum_6,
  "../assets/flowers/tulip/tulip_violet_3.png": tulip_violet_3,
};

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
  .map(([path, imgObj], index) => {
    const meta = parseMetaFromPath(path, index);
    const src = imgObj && typeof imgObj === "object" ? imgObj.src : imgObj;
    return {
      id: path,
      src,
      type: meta.type,
      label: meta.label,
    };
  });
