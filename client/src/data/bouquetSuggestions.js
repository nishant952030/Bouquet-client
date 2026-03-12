import { flowers } from "./flowerCatalog";

function flowerAt(index) {
  if (!flowers.length) return null;
  return flowers[index % flowers.length].src;
}

function stem(src, x, y, width, angle, zIndex) {
  return {
    stemId: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    src,
    x,
    y,
    width,
    angle,
    zIndex,
  };
}

// ─── Bouquet Builders ────────────────────────────────────────────────────────

/** Classic gentle arc — 5 flowers */
function romanticArc() {
  const slots = [
    [0.20, 0.72, 0.20, -9],
    [0.35, 0.62, 0.22, -5],
    [0.50, 0.56, 0.24, 0],
    [0.65, 0.62, 0.22, 5],
    [0.80, 0.72, 0.20, 9],
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Wide radial spread — 6 flowers */
function sunshineBurst() {
  const slots = [
    [0.50, 0.44, 0.26, 0],
    [0.32, 0.58, 0.20, -18],
    [0.68, 0.58, 0.20, 18],
    [0.25, 0.76, 0.17, -30],
    [0.75, 0.76, 0.17, 30],
    [0.50, 0.73, 0.18, 0],
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i + 2);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Clean three-flower statement */
function minimalTrio() {
  const slots = [
    [0.38, 0.66, 0.22, -8],
    [0.50, 0.56, 0.25, 0],
    [0.62, 0.66, 0.22, 8],
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i + 5);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Tall central stem flanked by two shorter side flowers — elegant & modern */
function cascadingWaterfall() {
  const slots = [
    [0.50, 0.42, 0.28, 0],  // tall center
    [0.30, 0.60, 0.21, -14],  // mid left
    [0.70, 0.60, 0.21, 14],  // mid right
    [0.20, 0.78, 0.17, -25],  // low left
    [0.80, 0.78, 0.17, 25],  // low right
    [0.42, 0.70, 0.18, -6],  // inner left fill
    [0.58, 0.70, 0.18, 6],  // inner right fill
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i + 1);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Dense dome — full, rounded, lush. Classic florist's hand-tied look. */
function gardenDome() {
  const slots = [
    // Crown
    [0.50, 0.45, 0.24, 0],
    [0.38, 0.50, 0.22, -8],
    [0.62, 0.50, 0.22, 8],
    // Mid ring
    [0.27, 0.60, 0.19, -16],
    [0.50, 0.57, 0.20, 0],
    [0.73, 0.60, 0.19, 16],
    // Base ring
    [0.20, 0.74, 0.16, -26],
    [0.40, 0.72, 0.17, -8],
    [0.60, 0.72, 0.17, 8],
    [0.80, 0.74, 0.16, 26],
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Asymmetric artisan style — off-center, natural, wild-gathered feel */
function wildMeadow() {
  const slots = [
    [0.60, 0.43, 0.25, 10],  // tall dominant right
    [0.35, 0.54, 0.22, -5],  // mid center-left
    [0.72, 0.60, 0.19, 20],  // leaning far right
    [0.22, 0.66, 0.18, -22],  // leaning far left
    [0.50, 0.64, 0.20, 3],  // center fill
    [0.62, 0.74, 0.16, 14],  // low right
    [0.33, 0.76, 0.15, -12],  // low left
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i + 3);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Single standout stem — one perfect flower, centered */
function soloStatement() {
  const slots = [
    [0.50, 0.50, 0.32, 0],
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Two mirrored stems leaning toward each other — intimate & symbolic */
function lovelyPair() {
  const slots = [
    [0.35, 0.54, 0.26, -10],
    [0.65, 0.54, 0.26, 10],
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i + 4);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Tall vertical column — architectural and dramatic */
function verticalTower() {
  const slots = [
    [0.50, 0.38, 0.22, 0],
    [0.44, 0.51, 0.20, -4],
    [0.56, 0.51, 0.20, 4],
    [0.50, 0.63, 0.18, 0],
    [0.44, 0.75, 0.17, -4],
    [0.56, 0.75, 0.17, 4],
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i + 6);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

/** Crescent moon silhouette — curved, sweeping, theatrical */
function lunarCrescent() {
  const slots = [
    [0.30, 0.48, 0.24, -35],  // top of crescent
    [0.22, 0.60, 0.21, -22],  // upper inner
    [0.26, 0.72, 0.19, -10],  // lower inner
    [0.38, 0.80, 0.17, 0],  // base
    [0.52, 0.78, 0.16, 10],  // trailing right
    [0.64, 0.70, 0.15, 20],  // far trailing
  ];
  return slots
    .map(([x, y, width, angle], i) => {
      const src = flowerAt(i + 1);
      return src ? stem(src, x, y, width, angle, i) : null;
    })
    .filter(Boolean);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const bouquetSuggestions = [
  {
    id: "romantic-arc",
    title: "Romantic Arc",
    description: "A soft, balanced five-flower curve — timeless and tender.",
    build: romanticArc,
  },
  {
    id: "sunshine-burst",
    title: "Sunshine Burst",
    description: "Wide, radiant, and playful — a burst of joy for someone special.",
    build: sunshineBurst,
  },
  {
    id: "minimal-trio",
    title: "Minimal Trio",
    description: "Three flowers. Clean. Intentional. Says everything without trying.",
    build: minimalTrio,
  },
  {
    id: "cascading-waterfall",
    title: "Cascading Waterfall",
    description: "A tall centrepiece flanked by gracefully falling stems — modern elegance.",
    build: cascadingWaterfall,
  },
  {
    id: "garden-dome",
    title: "Garden Dome",
    description: "Full, rounded, and lush — the classic hand-tied bouquet, perfected.",
    build: gardenDome,
  },
  {
    id: "wild-meadow",
    title: "Wild Meadow",
    description: "Loosely gathered, asymmetric, alive — like it was just picked from a field.",
    build: wildMeadow,
  },
  {
    id: "solo-statement",
    title: "Solo Statement",
    description: "One perfect flower. Because sometimes one is more than enough.",
    build: soloStatement,
  },
  {
    id: "lovely-pair",
    title: "Lovely Pair",
    description: "Two stems leaning in together — a quiet symbol of togetherness.",
    build: lovelyPair,
  },
  {
    id: "vertical-tower",
    title: "Vertical Tower",
    description: "Tall, architectural, and striking — a dramatic centerpiece arrangement.",
    build: verticalTower,
  },
  {
    id: "lunar-crescent",
    title: "Lunar Crescent",
    description: "A sweeping crescent silhouette — theatrical, poetic, and unforgettable.",
    build: lunarCrescent,
  },
];

export const noteSuggestions = [
  "I may not be there beside you today, but this bouquet carries my warmest hug.",
  "Thank you for being the calm in my loud days. You mean more than words can hold.",
  "I saw these flowers and thought of your smile. I hope they brighten your day.",
  "For every time you stood by me quietly, this is a small way to say I noticed.",
  "Distance is hard, but caring for you is easy. This is a piece of my heart for you.",
  "Just because. No reason needed when someone is this special.",
  "You deserve flowers on ordinary days too — not just the ones worth celebrating.",
  "If I could, I'd fill every room you walk into with flowers exactly like these.",
  "Sending this because you came to mind, and that's reason enough.",
  "For the person who never asks for anything — here's something just for you.",
];
