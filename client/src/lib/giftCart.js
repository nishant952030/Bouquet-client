export const GIFT_CART_KEY = "pw_gift_cart";

export const GIFT_PRODUCT_META = {
  bouquet: {
    label: "Flower Bouquet",
    shortLabel: "Bouquet",
    createPath: "/create",
    priceMinor: { INR: 100, USD: 1 }, // TEST PRICE — restore: INR: 3900, USD: 149
  },
  cake: {
    label: "3D Celebration Cake",
    shortLabel: "Cake",
    createPath: "/create-cake",
    priceMinor: { INR: 100, USD: 1 }, // TEST PRICE — restore: INR: 1900, USD: 99
  },
  mothers_day_card: {
    label: "Mother's Day Card",
    shortLabel: "Card",
    createPath: "/create-mothers-day-card",
    priceMinor: { INR: 100, USD: 1 }, // TEST PRICE — restore: INR: 3900, USD: 149
  },
  hug_card: {
    label: "Virtual Hug Card",
    shortLabel: "Hug",
    createPath: "/create-hug-card",
    priceMinor: { INR: 0, USD: 0 },
  },
};

const OCCASION_LABELS = {
  birthday: "Birthday",
  "mothers-day": "Mother's Day",
  "fathers-day": "Father's Day",
  anniversary: "Anniversary",
  wedding: "Wedding",
  graduation: "Graduation",
  "baby-shower": "Baby Sprinkle",
  "just-because": "Just Because",
  "thank-you": "Thank You",
};

function createCartItemId() {
  return `ci${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeCartItem(item) {
  if (!item || !GIFT_PRODUCT_META[item.type]) return null;
  return {
    cartItemId: String(item.cartItemId || createCartItemId()),
    type: item.type,
    payload: item.payload && typeof item.payload === "object" ? item.payload : {},
    addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
  };
}

export function normalizeCurrency(countryCode) {
  return String(countryCode || "").toUpperCase() === "IN" ? "INR" : "USD";
}

export function loadGiftCart() {
  if (typeof window === "undefined") return [];
  const parsed = safeParse(localStorage.getItem(GIFT_CART_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeCartItem).filter(Boolean);
}

export function saveGiftCart(items) {
  if (typeof window === "undefined") return [];
  const normalized = Array.isArray(items) ? items.map(normalizeCartItem).filter(Boolean) : [];
  localStorage.setItem(GIFT_CART_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("gift-cart-updated", { detail: normalized }));
  return normalized;
}

export function addGiftCartItem(type, payload = {}) {
  if (!GIFT_PRODUCT_META[type]) return null;
  const item = normalizeCartItem({
    cartItemId: createCartItemId(),
    type,
    payload,
    addedAt: new Date().toISOString(),
  });
  saveGiftCart([...loadGiftCart(), item]);
  return item;
}

export function removeGiftCartItem(cartItemId) {
  const next = loadGiftCart().filter((item) => item.cartItemId !== cartItemId);
  saveGiftCart(next);
  return next;
}

export function clearGiftCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GIFT_CART_KEY);
  window.dispatchEvent(new CustomEvent("gift-cart-updated", { detail: [] }));
}

export function getGiftProductMeta(type) {
  return GIFT_PRODUCT_META[type] || null;
}

export function getGiftItemPriceMinor(item, currency) {
  const meta = getGiftProductMeta(item?.type);
  const normalizedCurrency = currency === "INR" ? "INR" : "USD";
  return Number(meta?.priceMinor?.[normalizedCurrency] || 0);
}

export function getGiftCartTotals(items, currency) {
  const normalized = Array.isArray(items) ? items : [];
  const totalMinor = normalized.reduce(
    (sum, item) => sum + getGiftItemPriceMinor(item, currency),
    0,
  );
  return {
    itemCount: normalized.length,
    totalMinor,
    currency: currency === "INR" ? "INR" : "USD",
  };
}

export function formatCartMoney(minor, currency) {
  const value = Number(minor || 0);
  if (value <= 0) return "Free";
  if (currency === "INR") return `Rs ${Math.round(value / 100)}`;
  return `$${(value / 100).toFixed(2)}`;
}

export function getGiftItemTitle(item) {
  const payload = item?.payload || {};
  switch (item?.type) {
    case "bouquet":
      return payload.senderName?.trim()
        ? `Bouquet from ${payload.senderName.trim()}`
        : "Flower bouquet";
    case "cake": {
      const occasion = OCCASION_LABELS[payload.occasion] || "Celebration";
      return payload.name?.trim()
        ? `${occasion} cake for ${payload.name.trim()}`
        : `${occasion} cake`;
    }
    case "mothers_day_card":
      return payload.to?.trim()
        ? `Mother's Day card for ${payload.to.trim()}`
        : "Mother's Day card";
    case "hug_card":
      return "Virtual hug card";
    default:
      return getGiftProductMeta(item?.type)?.label || "Gift";
  }
}

export function getGiftItemSubtitle(item) {
  const payload = item?.payload || {};
  switch (item?.type) {
    case "bouquet": {
      const stems = Array.isArray(payload.stems) ? payload.stems.length : 0;
      const note = payload.note?.trim();
      if (stems && note) return `${stems} flowers with a note`;
      if (stems) return `${stems} flowers`;
      if (note) return "Personal flower note";
      return "Custom flower arrangement";
    }
    case "cake": {
      const toppings = Array.isArray(payload.toppings) ? payload.toppings.length : 0;
      const candles = Array.isArray(payload.candles) ? payload.candles.length : Number(payload.age || 0);
      return `${candles || 1} candle${candles === 1 ? "" : "s"}${toppings ? `, ${toppings} topping${toppings === 1 ? "" : "s"}` : ""}`;
    }
    case "mothers_day_card":
      return payload.from?.trim() ? `From ${payload.from.trim()}` : "Personal message card";
    case "hug_card":
      return "Pull-to-open hug animation";
    default:
      return "Digital gift";
  }
}
