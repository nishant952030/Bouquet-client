import { flowers } from "./flowerCatalog";

function getFlower(query) {
  if (!flowers.length) return null;
  const q = query.toLowerCase();
  const match = flowers.find(
    (f) =>
      f.id.toLowerCase().includes(q) ||
      (f.type && f.type.toLowerCase().includes(q)) ||
      (f.label && f.label.toLowerCase().includes(q))
  );
  return match ? match.src : flowers[0].src;
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

// ─── Florist-Grade Radial Preset Builders ─────────────────────────────────────

/** Blush Romance — Lush Peony hero with Peach Rose, Sakura & Baby's Breath */
function romanticArc() {
  const peony = getFlower("peony");
  const peachRose = getFlower("peach");
  const rose = getFlower("rose_1") || getFlower("rose");
  const babysBreath = getFlower("babys_breath") || getFlower("daisy");
  const sakura = getFlower("sakura") || getFlower("tulip");

  const list = [
    [babysBreath, 0.35, 0.44, 0.44, -18, 0],
    [sakura, 0.65, 0.44, 0.44, 18, 1],
    [peachRose, 0.40, 0.52, 0.47, -9, 2],
    [rose, 0.60, 0.52, 0.47, 9, 3],
    [peony, 0.50, 0.59, 0.56, 0, 4],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Sunshine Glow — Bright Golden Sunflower with Chamomile Daisies & Warm Peach */
function sunshineBurst() {
  const sunflower = getFlower("sunflower_2") || getFlower("sunflower");
  const daisy = getFlower("daisy");
  const peachRose = getFlower("peach") || getFlower("rose");
  const sampaguita = getFlower("sampaguita") || getFlower("babys_breath");

  const list = [
    [daisy, 0.33, 0.46, 0.44, -22, 0],
    [daisy, 0.67, 0.46, 0.44, 22, 1],
    [peachRose, 0.41, 0.53, 0.47, -8, 2],
    [sampaguita, 0.59, 0.53, 0.45, 8, 3],
    [sunflower, 0.50, 0.58, 0.57, 0, 4],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Minimal Trio — Clean, intentional, modern aesthetic */
function minimalTrio() {
  const babysBreath = getFlower("babys_breath") || getFlower("daisy");
  const daisy = getFlower("daisy");
  const peony = getFlower("peony") || getFlower("rose");

  const list = [
    [babysBreath, 0.50, 0.43, 0.48, 0, 0],
    [daisy, 0.39, 0.55, 0.45, -10, 1],
    [peony, 0.61, 0.55, 0.52, 8, 2],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Twilight Lavender — Fragrant English Lavender with Lilac & Violet Tulips */
function cascadingWaterfall() {
  const lavender = getFlower("lavender");
  const lilac = getFlower("lilac") || getFlower("tulip");
  const violet = getFlower("violet") || getFlower("tulip");
  const babysBreath = getFlower("babys_breath") || getFlower("daisy");
  const peachRose = getFlower("peach") || getFlower("rose");

  const list = [
    [lavender, 0.36, 0.42, 0.42, -18, 0],
    [lavender, 0.64, 0.42, 0.42, 18, 1],
    [lilac, 0.50, 0.39, 0.44, 0, 2],
    [babysBreath, 0.41, 0.52, 0.45, -9, 3],
    [violet, 0.59, 0.52, 0.45, 9, 4],
    [peachRose, 0.50, 0.59, 0.55, 0, 5],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Sampaguita Dream — Philippine National Flower with Blush Peony & Sakura */
function gardenDome() {
  const sampaguita = getFlower("sampaguita");
  const sakura = getFlower("sakura");
  const babysBreath = getFlower("babys_breath");
  const daisy = getFlower("daisy");
  const peachRose = getFlower("peach") || getFlower("rose");
  const peony = getFlower("peony");

  const list = [
    [sampaguita, 0.34, 0.44, 0.44, -20, 0],
    [sakura, 0.66, 0.44, 0.44, 20, 1],
    [babysBreath, 0.50, 0.41, 0.45, 0, 2],
    [daisy, 0.37, 0.52, 0.45, -10, 3],
    [peachRose, 0.63, 0.52, 0.47, 10, 4],
    [peony, 0.50, 0.59, 0.56, 0, 5],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Wild Meadow — Hand-gathered, natural countryside botanical blend */
function wildMeadow() {
  const lavender = getFlower("lavender");
  const daisy = getFlower("daisy");
  const babysBreath = getFlower("babys_breath");
  const sampaguita = getFlower("sampaguita");
  const peachRose = getFlower("peach");
  const peony = getFlower("peony");

  const list = [
    [lavender, 0.31, 0.44, 0.42, -22, 0],
    [daisy, 0.69, 0.46, 0.45, 20, 1],
    [babysBreath, 0.48, 0.43, 0.45, 4, 2],
    [sampaguita, 0.39, 0.53, 0.45, -8, 3],
    [peachRose, 0.59, 0.54, 0.48, 10, 4],
    [peony, 0.48, 0.60, 0.56, -2, 5],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Solo Statement — One breathtaking blooming centerpiece */
function soloStatement() {
  const hero = getFlower("peony") || getFlower("sunflower_2") || getFlower("rose");
  return [stem(hero, 0.50, 0.53, 0.60, 0, 0)];
}

/** Lovely Pair — Two stems leaning lovingly together with delicate baby's breath */
function lovelyPair() {
  const babysBreath = getFlower("babys_breath");
  const peony = getFlower("peony");
  const peachRose = getFlower("peach") || getFlower("rose");

  const list = [
    [babysBreath, 0.50, 0.43, 0.46, 0, 0],
    [peony, 0.40, 0.54, 0.52, -9, 1],
    [peachRose, 0.60, 0.54, 0.52, 9, 2],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Vertical Tower — Architectural Sakura & Sampaguita arrangement */
function verticalTower() {
  const sakura = getFlower("sakura");
  const babysBreath = getFlower("babys_breath");
  const sampaguita = getFlower("sampaguita");
  const peony = getFlower("peony");

  const list = [
    [sakura, 0.50, 0.35, 0.46, 0, 0],
    [babysBreath, 0.41, 0.48, 0.44, -6, 1],
    [sampaguita, 0.59, 0.48, 0.44, 6, 2],
    [peony, 0.50, 0.58, 0.56, 0, 3],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

/** Sweet Dream Crescent — Sweeping crescent arc */
function lunarCrescent() {
  const sakura = getFlower("sakura");
  const lavender = getFlower("lavender");
  const babysBreath = getFlower("babys_breath");
  const peachRose = getFlower("peach");
  const daisy = getFlower("daisy");

  const list = [
    [sakura, 0.33, 0.40, 0.46, -26, 0],
    [lavender, 0.31, 0.50, 0.42, -15, 1],
    [babysBreath, 0.39, 0.58, 0.44, -5, 2],
    [peachRose, 0.53, 0.60, 0.50, 6, 3],
    [daisy, 0.65, 0.56, 0.44, 16, 4],
  ];
  return list.map(([src, x, y, width, angle, z]) => stem(src, x, y, width, angle, z));
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const bouquetSuggestions = [
  {
    id: "romantic-arc",
    title: "Blush Romance",
    description: "Lush pink Peony, Peach Rose & Sakura fanned with Baby's Breath.",
    build: romanticArc,
  },
  {
    id: "sunshine-burst",
    title: "Sunshine Glow",
    description: "Golden Sunflower hero with Chamomile Daisies & sweet Sampaguita.",
    build: sunshineBurst,
  },
  {
    id: "minimal-trio",
    title: "Modern Trio",
    description: "Three flowers. Clean. Intentional. Says everything without trying.",
    build: minimalTrio,
  },
  {
    id: "cascading-waterfall",
    title: "Twilight Lavender",
    description: "Fragrant English Lavender with Lilac & Violet Tulips — pure calm.",
    build: cascadingWaterfall,
  },
  {
    id: "garden-dome",
    title: "Sampaguita Dream",
    description: "Philippine Sampaguita paired with Blush Peony & fresh blossoms.",
    build: gardenDome,
  },
  {
    id: "wild-meadow",
    title: "Wildflower Meadow",
    description: "Loosely gathered, asymmetric, alive — like it was just handpicked.",
    build: wildMeadow,
  },
  {
    id: "solo-statement",
    title: "Solo Statement",
    description: "One perfect hero bloom. Because sometimes one is more than enough.",
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
    title: "Sakura Tower",
    description: "Graceful vertical Cherry Blossom and Sampaguita centerpiece.",
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

export const noteSuggestionsPH = [
  "Kahit malayo ako ngayon, sana maramdaman mo ang yakap ko sa mga bulaklak na 'to. Ingat ka palagi! 💕",
  "Happy Monthsary, my love! Bawat araw kasama ka, lalong sumasaya ang buhay ko. 🌸",
  "Para sa pinakamalakas at mapagmahal na Mama — salamat po sa lahat. Mahal na mahal kita! 💐",
  "Naisip lang kita bigla. Sana mapangiti ka nitong munting bouquet ko para sa'yo! ✨",
  "Bati na tayo please? 🥺 Peace offering muna bago ako bumili ng favorite mong milk tea!",
  "Walang okasyon, gusto ko lang ipaalala sa'yo kung gaano ka kahalaga sa akin. ❤️",
  "Happy Birthday! Sobrang thankful ako kay Lord na dumating ka sa buhay ko. 🎂💐",
  "Miss na miss na kita. Konting tiis na lang, magkakasama rin tayo ulit. Kapit lang! 🥺🌸",
];

export const occasionsPH = [
  { emoji: "💖", label: "Monthsary", note: "Happy Monthsary, my love! Bawat araw kasama ka, lalong sumasaya ang buhay ko. 🌸" },
  { emoji: "🌸", label: "Para kay Nanay", note: "Para sa pinakamalakas at mapagmahal kong Mama — salamat po sa lahat. Mahal na mahal kita! 💐" },
  { emoji: "🥺", label: "Pang-suyo", note: "Bati na tayo please? 🥺 Peace offering muna bago ako bumili ng favorite mong milk tea!" },
  { emoji: "✈️", label: "LDR / Miss You", note: "Kahit malayo ako, sana maramdaman mo ang yakap ko sa munting bouquet na 'to. Miss na miss na kita! 💕" },
  { emoji: "🎂", label: "Birthday", note: "Happy Birthday! Wishing you all the love, happiness, and peace in the world today. 🎂💐" },
  { emoji: "✨", label: "Just Because", note: "Naisip lang kita bigla. Sana mapangiti ka nitong munting bouquet ko para sa'yo! ✨" },
];

