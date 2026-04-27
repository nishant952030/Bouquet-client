const SITE_NAME = "Petals and Words";

function upsertMeta(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

function upsertLink(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

function upsertScript(selector, json) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.setAttribute("data-seo-ld", "page");
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(json);
}

export function applySeo({
  title,
  description,
  keywords = [],
  path = "/",
  image = "/logo-transparent.png",
  robots = "index,follow",
  jsonLd,
  alternates = [],
}) {
  const baseUrl = window.location.origin;
  const canonical = `${baseUrl}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const keywordText = Array.isArray(keywords) ? keywords.join(", ") : "";

  document.title = fullTitle;

  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywordText });
  upsertMeta('meta[name="robots"]', { name: "robots", content: robots });

  upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: `${baseUrl}${image}` });

  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: `${baseUrl}${image}` });

  upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonical });
  document.head.querySelectorAll('link[data-seo-alt="page"]').forEach((el) => el.remove());
  if (Array.isArray(alternates)) {
    alternates.forEach((alt) => {
      if (!alt?.href || !alt?.hreflang) return;
      const element = document.createElement("link");
      element.setAttribute("rel", "alternate");
      element.setAttribute("hreflang", alt.hreflang);
      element.setAttribute("href", `${baseUrl}${alt.href}`);
      element.setAttribute("data-seo-alt", "page");
      document.head.appendChild(element);
    });
  }

  if (jsonLd) {
    upsertScript('script[data-seo-ld="page"]', jsonLd);
  }
}

export const seoKeywords = {
  home: [
    "free online bouquet maker",
    "virtual bouquet maker",
    "digital bouquet maker",
    "online bouquet maker free",
    "online flower bouquet maker",
    "online bouquet creator",
    "bouquet maker online",
    "virtual birthday cake",
    "send digital birthday cake",
    "online birthday cake maker",
    "virtual cake with candles",
    "virtual flower maker",
    "free bouquet maker",
    "virtual bouquet creator",
    "digital flower bouquet",
    "bouquet with message",
    "send flowers with note",
    "send digital bouquet free",
    "digital bouquet gift free",
    "online bouquet with note",
    "romantic flower message",
    "apology flower note",
    "birthday bouquet message",
    "free digital flowers",
    "send virtual flowers online",
    "create bouquet online free",
  ],
  create: [
    "create digital bouquet online free",
    "online bouquet creator free",
    "bouquet maker online free",
    "virtual bouquet maker free",
    "online flower bouquet maker free",
    "build bouquet online",
    "custom bouquet generator",
    "flower arrangement app free",
    "write bouquet note",
    "AI love note generator",
    "online flower card maker",
    "digital bouquet gift free",
    "send bouquet link free",
    "make digital flowers",
  ],
  payment: [
    "share bouquet link",
    "free bouquet sharing",
    "send digital bouquet free",
    "flower message link",
    "share digital flowers",
    "free bouquet delivery online",
  ],
  view: [
    "view digital bouquet",
    "online flower message",
    "shared bouquet link",
    "receive digital flowers",
    "digital bouquet gift",
  ],
};
