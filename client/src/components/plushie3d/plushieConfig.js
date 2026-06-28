export const PLUSHIE_TYPES = [
  { id: "bear", labelKey: "plushie.bear", defaultColor: "#8d5b4c" },
  { id: "bunny", labelKey: "plushie.bunny", defaultColor: "#f7ebd9" },
  { id: "panda", labelKey: "plushie.panda", defaultColor: "#ffffff" }
];

export const COLOR_PRESETS = {
  bear: [
    { id: "brown", hex: "#8d5b4c", label: "Classic Brown" },
    { id: "caramel", hex: "#c68b59", label: "Caramel Honey" },
    { id: "beige", hex: "#e0c3a8", label: "Soft Cream" },
    { id: "pink", hex: "#fbc4ab", label: "Rose Petal" },
    { id: "blue", hex: "#a0c4ff", label: "Sky Blue" }
  ],
  bunny: [
    { id: "white", hex: "#ffffff", label: "Snow White" },
    { id: "cream", hex: "#fcf6bd", label: "Soft Butter" },
    { id: "gray", hex: "#d3d3d3", label: "Mist Gray" },
    { id: "lavender", hex: "#e8dbfc", label: "Lavender" },
    { id: "mint", hex: "#cbf3f0", label: "Mint Ice" }
  ],
  panda: [
    { id: "panda", hex: "#ffffff", label: "Panda Pattern" }
  ]
};

export const ACCESSORIES = [
  { id: "none", emoji: "❌", label: "None" },
  { id: "bowtie", emoji: "🎀", label: "Bowtie" },
  { id: "glasses", emoji: "👓", label: "Glasses" },
  { id: "heart", emoji: "❤️", label: "Love Heart" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "balloon", emoji: "🎈", label: "Balloon" }
];

export const BOX_STYLES = [
  { id: "romantic", label: "Romantic Pink", baseBg: "#fbcfe8", ribbonBg: "#be185d" },
  { id: "classic", label: "Classic Ivory", baseBg: "#fffbeb", ribbonBg: "#d97706" },
  { id: "royal", label: "Royal Blue", baseBg: "#bfdbfe", ribbonBg: "#1d4ed8" },
  { id: "festive", label: "Festive Mint", baseBg: "#a7f3d0", ribbonBg: "#047857" },
  { id: "birthday", label: "Party Gold", baseBg: "#fef08a", ribbonBg: "#db2777" }
];

export const DEFAULT_PLUSHIE = {
  plushieType: "bear",
  furColor: "#8d5b4c",
  accessory: "none",
  boxStyle: "romantic",
  to: "",
  from: "",
  msg: "",
  musicTrack: "none"
};
