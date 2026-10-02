import hydrangea_1 from "../assets/flowers/hydrangea/hydrangea_1.png";
import hydrangea_blue_2 from "../assets/flowers/hydrangea/hydrangea_blue_2.png";
import rose_1 from "../assets/flowers/rose/rose_1.png";
import rose_2 from "../assets/flowers/rose/rose_2.png";
import rose_3 from "../assets/flowers/rose/rose_3.png";
import rose_4 from "../assets/flowers/rose/rose_4.png";
import rose_5 from "../assets/flowers/rose/rose_5.png";
import rose_peach_1 from "../assets/flowers/rose/rose_peach_1.png";
import rose_crimson_6 from "../assets/flowers/rose/rose_crimson_6.png";
import sunflower_1 from "../assets/flowers/sunflower/sunflower_1.png";
import sunflower_2 from "../assets/flowers/sunflower/sunflower_2.png";
import tulip_1 from "../assets/flowers/tulip/tulip_1.png";
import tulip_deep_purple_4 from "../assets/flowers/tulip/tulip_deep_purple_4.png";
import tulip_lavender_1 from "../assets/flowers/tulip/tulip_lavender_1.png";
import tulip_lilac_2 from "../assets/flowers/tulip/tulip_lilac_2.png";
import tulip_mauve_5 from "../assets/flowers/tulip/tulip_mauve_5.png";
import tulip_plum_6 from "../assets/flowers/tulip/tulip_plum_6.png";
import tulip_violet_3 from "../assets/flowers/tulip/tulip_violet_3.png";
import peony_1 from "../assets/flowers/peony/peony_1.png";
import daisy_1 from "../assets/flowers/daisy/daisy_1.png";
import babys_breath_1 from "../assets/flowers/babys_breath/babys_breath_1.png";
import sakura_1 from "../assets/flowers/sakura/sakura_1.png";
import sampaguita_1 from "../assets/flowers/sampaguita/sampaguita_1.png";
import lavender_1 from "../assets/flowers/lavender/lavender_1.png";
import lily_1 from "../assets/flowers/lily/lily_1.png";
import marigold_1 from "../assets/flowers/marigold/marigold_1.png";
import orchid_1 from "../assets/flowers/orchid/orchid_1.png";
import dahlia_1 from "../assets/flowers/dahlia/dahlia_1.png";

const flowerModules = {
  "../assets/flowers/peony/peony_1.png": peony_1,
  "../assets/flowers/sakura/sakura_1.png": sakura_1,
  "../assets/flowers/daisy/daisy_1.png": daisy_1,
  "../assets/flowers/babys_breath/babys_breath_1.png": babys_breath_1,
  "../assets/flowers/sampaguita/sampaguita_1.png": sampaguita_1,
  "../assets/flowers/lavender/lavender_1.png": lavender_1,
  "../assets/flowers/lily/lily_1.png": lily_1,
  "../assets/flowers/marigold/marigold_1.png": marigold_1,
  "../assets/flowers/orchid/orchid_1.png": orchid_1,
  "../assets/flowers/dahlia/dahlia_1.png": dahlia_1,
  "../assets/flowers/rose/rose_peach_1.png": rose_peach_1,
  "../assets/flowers/rose/rose_crimson_6.png": rose_crimson_6,
  "../assets/flowers/rose/rose_1.png": rose_1,
  "../assets/flowers/rose/rose_2.png": rose_2,
  "../assets/flowers/rose/rose_3.png": rose_3,
  "../assets/flowers/rose/rose_4.png": rose_4,
  "../assets/flowers/rose/rose_5.png": rose_5,
  "../assets/flowers/sunflower/sunflower_2.png": sunflower_2,
  "../assets/flowers/sunflower/sunflower_1.png": sunflower_1,
  "../assets/flowers/hydrangea/hydrangea_1.png": hydrangea_1,
  "../assets/flowers/hydrangea/hydrangea_blue_2.png": hydrangea_blue_2,
  "../assets/flowers/tulip/tulip_1.png": tulip_1,
  "../assets/flowers/tulip/tulip_deep_purple_4.png": tulip_deep_purple_4,
  "../assets/flowers/tulip/tulip_lavender_1.png": tulip_lavender_1,
  "../assets/flowers/tulip/tulip_lilac_2.png": tulip_lilac_2,
  "../assets/flowers/tulip/tulip_mauve_5.png": tulip_mauve_5,
  "../assets/flowers/tulip/tulip_plum_6.png": tulip_plum_6,
  "../assets/flowers/tulip/tulip_violet_3.png": tulip_violet_3,
};

const customLabels = {
  "peony_1": { type: "Peony", label: "Blush Peony" },
  "sakura_1": { type: "Sakura", label: "Cherry Blossom" },
  "daisy_1": { type: "Daisy", label: "Chamomile Daisy" },
  "babys_breath_1": { type: "Baby's Breath", label: "Baby's Breath" },
  "sampaguita_1": { type: "Sampaguita", label: "Sampaguita" },
  "lavender_1": { type: "Lavender", label: "English Lavender" },
  "rose_peach_1": { type: "Rose", label: "Peach Garden Rose" },
  "rose_crimson_6": { type: "Rose", label: "Velvet Crimson Rose" },
  "sunflower_2": { type: "Sunflower", label: "Golden Sunflower" },
  "lily_1": { type: "Lily", label: "Stargazer Oriental Lily" },
  "marigold_1": { type: "Marigold", label: "Golden Marigold" },
  "orchid_1": { type: "Orchid", label: "Purple Moth Orchid" },
  "hydrangea_blue_2": { type: "Hydrangea", label: "Periwinkle Hydrangea" },
  "dahlia_1": { type: "Dahlia", label: "Burgundy Dahlia" },
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
  
  if (customLabels[filename]) {
    return customLabels[filename];
  }

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
