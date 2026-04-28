export const CAKE_RADIUS = 1.26;
export const CAKE_HEIGHT = 0.54;
export const CAKE_TOP_Y = CAKE_HEIGHT;
export const CANDLE_HEIGHT = 0.56;
export const MAX_CANDLES = 18;
export const MAX_CREAM_SWIRLS = 24;
export const MAX_TOPPINGS = 48;
export const MIN_TIERS = 1;
export const MAX_TIERS = 3;

export const TOPPING_TYPES = {
  cherry: { label: "Cherry", color: "#c71f37" },
  sprinkle: { label: "Sprinkle", color: "#4dd4f0" },
  chip: { label: "Choc chip", color: "#3a211b" },
};

export const FLAVORS = {
  chocolate: {
    label: "Chocolate",
    cake: "#5a342a",
    side: "#43231c",
    frosting: "#f4c7a1",
    accent: "#7a4435",
  },
  vanilla: {
    label: "Vanilla",
    cake: "#f4d37d",
    side: "#d9a94f",
    frosting: "#fff6cf",
    accent: "#c98b31",
  },
  strawberry: {
    label: "Strawberry",
    cake: "#f28aa7",
    side: "#ce5f7f",
    frosting: "#ffd1dd",
    accent: "#d94c76",
  },
};

export function getCakeTopY(tiers = 1) {
  return CAKE_HEIGHT * Math.min(Math.max(tiers, MIN_TIERS), MAX_TIERS);
}

export function getCakeTopRadius(tiers = 1) {
  return CAKE_RADIUS - (Math.min(Math.max(tiers, MIN_TIERS), MAX_TIERS) - 1) * 0.2;
}

export function clampCandlePosition(point, tiers = 1) {
  const radius = Math.hypot(point.x, point.z);
  const maxRadius = getCakeTopRadius(tiers) - 0.14;
  const topY = getCakeTopY(tiers);

  if (radius <= maxRadius) {
    return { x: point.x, y: topY, z: point.z };
  }

  const scale = maxRadius / radius;
  return {
    x: point.x * scale,
    y: topY,
    z: point.z * scale,
  };
}

export function createGeneratedCandlePosition(index, tiers = 1) {
  const angle = index * 2.399963;
  const radius = Math.min(0.2 + index * 0.07, getCakeTopRadius(tiers) - 0.18);

  return {
    x: Math.cos(angle) * radius,
    y: getCakeTopY(tiers),
    z: Math.sin(angle) * radius,
  };
}

export function createGeneratedCreamPosition(index, tiers = 1) {
  const angle = index * 2.18 + 0.6;
  const radius = Math.min(0.28 + index * 0.045, getCakeTopRadius(tiers) - 0.14);

  return {
    x: Math.cos(angle) * radius,
    y: getCakeTopY(tiers) + 0.08,
    z: Math.sin(angle) * radius,
  };
}

export function createGeneratedToppingPosition(index, tiers = 1) {
  const angle = index * 2.62 + 1.1;
  const radius = Math.min(0.18 + index * 0.038, getCakeTopRadius(tiers) - 0.12);

  return {
    x: Math.cos(angle) * radius,
    y: getCakeTopY(tiers) + 0.105,
    z: Math.sin(angle) * radius,
  };
}
