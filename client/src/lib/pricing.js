const OFFER_START = "2026-03-07T00:00:00+05:30";
const OFFER_END = "2026-03-09T23:59:59+05:30";

const BASE_SMALL_PRICE = 29;
const OFFER_SMALL_PRICE = 19;
const UNLIMITED_PRICE = 59;
const SMALL_PLAN_USD_CENTS = 99;
const UNLIMITED_PLAN_USD_CENTS = 199;

export function isLaunchOfferActive(now = new Date()) {
  const start = new Date(OFFER_START);
  const end = new Date(OFFER_END);
  return now >= start && now <= end;
}

export function getSmallPlanPrice(now = new Date()) {
  return isLaunchOfferActive(now) ? OFFER_SMALL_PRICE : BASE_SMALL_PRICE;
}

export function getSmallPlanOriginalPrice(now = new Date()) {
  return isLaunchOfferActive(now) ? BASE_SMALL_PRICE : null;
}

export function getUnlimitedPlanPrice() {
  return UNLIMITED_PRICE;
}

export function getOfferDateLabel() {
  return "Mar 7 - Mar 9, 2026";
}

export function getSmallPlanUsdCents() {
  return SMALL_PLAN_USD_CENTS;
}

export function getUnlimitedPlanUsdCents() {
  return UNLIMITED_PLAN_USD_CENTS;
}

export function formatUsdFromCents(cents) {
  const value = Number(cents || 0) / 100;
  return `$${value.toFixed(2)}`;
}
