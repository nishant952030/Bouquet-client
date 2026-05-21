import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { blogPosts } from "../src/data/blogPosts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_NAME = "Petals and Words";
const SITE_URL = "https://www.petalsandwords.com";
const LOGO_URL = `${SITE_URL}/logo-transparent.png`;
const LASTMOD = "2026-05-15";

const homeFaq = [
  {
    q: "Is Petals and Words free to use?",
    a: "Yes. You can create and share digital bouquets, cards, and virtual cakes without creating an account.",
  },
  {
    q: "How do I send a digital bouquet?",
    a: "Create your bouquet, add a personal note, and share the generated link through WhatsApp, text, email, or any messaging app.",
  },
  {
    q: "Can I send digital gifts internationally?",
    a: "Yes. Digital gift links work worldwide on modern browsers, so there are no shipping delays.",
  },
];

const appRoutes = [
  {
    path: "/",
    title: "Free Online Bouquet Maker | Create and Send Digital Flowers",
    description:
      "Create a free digital bouquet with a personal note and share it instantly. No signup, no download. Make online bouquets, cards, and virtual cakes.",
    keywords: [
      "free online bouquet maker",
      "virtual bouquet maker",
      "digital bouquet maker",
      "online flower bouquet maker",
      "send digital flowers",
      "digital gift",
    ],
    kind: "application",
    priority: "1.0",
    changefreq: "daily",
    faqs: homeFaq,
  },
  {
    path: "/create",
    title: "Create Free Digital Bouquet Online | Add Flowers and Personal Note",
    description:
      "Create a free digital bouquet online. Choose flowers, write a heartfelt note, and share your bouquet link instantly. No signup required.",
    keywords: [
      "create digital bouquet online free",
      "online bouquet creator free",
      "bouquet maker online free",
      "custom bouquet generator",
      "send bouquet link free",
    ],
    kind: "application",
    priority: "0.95",
    changefreq: "weekly",
  },
  {
    path: "/create-cake",
    title: "Free Virtual Birthday Cake Maker | Create a 3D Cake Online",
    description:
      "Create a free interactive 3D birthday cake online. Choose flavors, add candles and toppings, write a message, and send a virtual cake link instantly.",
    keywords: [
      "free virtual birthday cake",
      "virtual birthday cake maker",
      "online birthday cake maker",
      "3d cake maker online",
      "send virtual birthday cake",
    ],
    kind: "application",
    priority: "0.95",
    changefreq: "weekly",
  },
  {
    path: "/hug-card",
    title: "Send a Virtual Hug Card Online | Free Interactive Hug",
    description:
      "Send a free virtual hug card online. Create an interactive hug card for Mother's Day, long-distance love, encouragement, or a thoughtful surprise.",
    keywords: [
      "virtual hug card",
      "send a virtual hug",
      "free hug card online",
      "interactive hug card",
      "digital hug card free",
    ],
    kind: "application",
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    path: "/mothers-day-card",
    title: "Mother's Day Card Online | Free Interactive Card for Mom",
    description:
      "Open and share a beautiful interactive Mother's Day card online. Send Mom a personalized digital card she can keep forever.",
    keywords: [
      "mothers day card online",
      "digital mothers day card",
      "interactive mothers day card",
      "card for mom online",
    ],
    kind: "application",
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    path: "/mothers-day",
    title: "Mother's Day Digital Gift | Free Card, Bouquet and Hug",
    description:
      "Create a free digital Mother's Day gift for Mom: an interactive card, a virtual flower bouquet, or a pull-to-open hug card.",
    keywords: [
      "mothers day digital gift",
      "free online gift for mom",
      "digital mothers day present",
      "virtual gift for mother",
    ],
    kind: "application",
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    path: "/create-mothers-day-card",
    title: "Create a Mother's Day Card | Personalize and Share Free",
    description:
      "Create a personalized, interactive Mother's Day card with custom messages, paper textures, and decorations. Share it with Mom instantly.",
    keywords: [
      "create mothers day card online",
      "personalized mothers day card free",
      "send mothers day card online",
      "digital mothers day card maker",
    ],
    kind: "application",
    priority: "0.9",
    changefreq: "weekly",
  },
];

const bouquetKeywordRoutes = [
  ["/virtual-bouquet-maker", "Virtual Bouquet Maker Online | Free Digital Flower Builder", "Create a virtual bouquet online, add a heartfelt note, and share a beautiful flower gift instantly with one link.", ["virtual bouquet maker", "virtual flower bouquet maker online free", "virtual flower maker"]],
  ["/virtual-bouquet-maker-online-free", "Virtual Bouquet Maker Online Free | No Signup", "Use a free virtual bouquet maker online. Pick flowers, write your note, and send one clean bouquet link in under a minute.", ["virtual bouquet maker online free", "free virtual bouquet maker", "virtual bouquet free"]],
  ["/virtual-bouquet", "Virtual Bouquet | Send Digital Flowers with Message", "Send a virtual bouquet with a personal message. Create your flowers online and share instantly through one secure link.", ["virtual bouquet", "send virtual bouquet", "virtual flower gift"]],
  ["/virtual-bouquet-maker-free", "Virtual Bouquet Maker Free | Create and Share Online", "Try a free virtual bouquet maker. Design a custom bouquet, add your note, and share it instantly.", ["virtual bouquet maker free", "virtual flower maker free", "online bouquet maker free"]],
  ["/digital-bouquet-maker", "Digital Bouquet Maker | Personalized Flower Messages", "Use a digital bouquet maker to craft custom flower arrangements and pair them with personal notes for birthdays, apologies, and love messages.", ["digital bouquet maker", "digital flower bouquet", "bouquet with message"]],
  ["/digital-bouquet-maker-online-free", "Digital Bouquet Maker Online Free | Fast Share Link", "Create a digital bouquet online for free. Choose flowers, write your message, and share instantly.", ["digital bouquet maker online free", "digital bouquet online free", "free digital bouquet maker"]],
  ["/digital-flower-bouquet-maker", "Digital Flower Bouquet Maker | Build Online in Minutes", "Use a digital flower bouquet maker to create beautiful online flower arrangements and pair them with personal notes.", ["digital flower bouquet maker", "online flower bouquet maker", "flower bouquet maker online"]],
  ["/digital-flower-bouquet", "Digital Flower Bouquet | Create and Send Online", "Create a digital flower bouquet online and send it with a personal message. Quick builder, beautiful output, instant share.", ["digital flower bouquet", "digital flowers online", "send digital flower bouquet"]],
  ["/online-bouquet-maker", "Online Bouquet Maker and Online Flower Bouquet Maker", "Try an online bouquet maker to create custom bouquets, write notes, and share instantly.", ["online bouquet maker", "online flower bouquet maker", "bouquet maker online"]],
  ["/bouquet-maker", "Bouquet Maker | Build and Share a Digital Bouquet", "Try a bouquet maker for personalized digital flower arrangements with message cards and instant share links.", ["bouquet maker", "bouquet creator", "digital bouquet maker"]],
  ["/bouquet-maker-online", "Bouquet Maker Online | Digital Flowers with Note", "Use this bouquet maker online to create flower arrangements with notes and share instantly with one link.", ["bouquet maker online", "online bouquet maker", "bouquet with note"]],
  ["/digital-bouquet-maker-usa", "Digital Bouquet Maker USA | Send Virtual Flowers Online", "Send virtual flowers in the USA with a digital bouquet maker. Create a bouquet, add your note, and share instantly.", ["digital bouquet maker usa", "send virtual flowers usa", "online bouquet usa"]],
  ["/digital-bouquet-maker-uk", "Digital Bouquet Maker UK | Send Online Flowers with Message", "Create and send online flowers in the UK with a custom message. Build your digital bouquet in minutes and share instantly.", ["digital bouquet maker uk", "online flowers uk digital", "virtual bouquet uk"]],
  ["/digital-bouquet-maker-canada", "Digital Bouquet Maker Canada | Virtual Flower Gift Online", "Use a digital bouquet maker in Canada to create virtual flower gifts with personalised notes and instant share links.", ["digital bouquet maker canada", "virtual flower gift canada", "digital flowers canada"]],
  ["/digital-bouquet-maker-australia", "Digital Bouquet Maker Australia | Online Virtual Bouquet", "Create a virtual bouquet in Australia with a custom note. Send meaningful digital flowers instantly with one secure link.", ["digital bouquet maker australia", "virtual bouquet australia", "online digital flowers australia"]],
].map(([pathName, title, description, keywords]) => ({
  path: pathName,
  title,
  description,
  keywords,
  kind: "webpage",
  priority: "0.82",
  changefreq: "weekly",
  faqs: [
    {
      q: "Is this bouquet maker free?",
      a: "Yes. You can create a digital bouquet and share it online without signing up.",
    },
    {
      q: "Can I add a personal note?",
      a: "Yes. Each bouquet can include a custom note before you share the link.",
    },
  ],
}));

const mothersDayKeywordRoutes = [
  ["/free-digital-mothers-day-card", "Free Digital Mother's Day Card | Create and Send Online", "Create a beautiful, personalized, and interactive digital Mother's Day card for free. Send instantly via WhatsApp, text, or email.", ["free digital mothers day card", "create mothers day card online", "personalized mothers day card free"]],
  ["/best-virtual-mothers-day-card", "Best Virtual Mother's Day Card | Interactive and Free", "Design a memorable virtual Mother's Day card with an interactive envelope reveal, custom message, and beautiful digital styling.", ["virtual mothers day card free", "best free digital mothers day card", "mothers day ecard free"]],
  ["/send-virtual-hug-mothers-day", "Send a Virtual Hug for Mother's Day | Free Hug Card", "Send Mom a free interactive virtual hug this Mother's Day. Share a warm digital embrace instantly with one link.", ["send virtual hug mothers day", "virtual hug for mom", "mothers day hug card free"]],
  ["/mothers-day-digital-gift", "Mother's Day Digital Gift | Free Card, Bouquet and Hug", "Give Mom a free digital gift for Mother's Day: choose from interactive cards, virtual bouquets, or a pull-to-open hug card.", ["mothers day digital gift free", "free online gift for mom", "virtual gift for mother"]],
  ["/interactive-mothers-day-card", "Interactive Mother's Day Card | Free Animated Card for Mom", "Create a free interactive Mother's Day card with an animated reveal effect, personal message, and instant sharing.", ["interactive mothers day card", "animated mothers day card free", "digital card for mom interactive"]],
].map(([pathName, title, description, keywords]) => ({
  path: pathName,
  title,
  description,
  keywords,
  kind: "webpage",
  priority: "0.85",
  changefreq: "weekly",
  faqs: [
    {
      q: "Is this Mother's Day card free?",
      a: "Yes. You can create and share the digital Mother's Day card online for free.",
    },
    {
      q: "Can I share it on WhatsApp?",
      a: "Yes. The card generates a link that can be shared on WhatsApp, text, email, or other messaging apps.",
    },
  ],
}));

const cakeKeywordRoutes = [
  ["/tl/virtual-cake-anniversary", "Virtual Cake Anniversary | Send an Online Cake", "Create a virtual anniversary cake online, add a message, and share it instantly with someone special.", ["virtual cake anniversary", "virtual cake online", "send online cake"]],
  ["/es/pastel-de-cumpleanos-virtual", "Pastel de Cumpleanos Virtual | Enviar Online Gratis", "Crea un pastel de cumpleanos virtual en 3D. Escribe un mensaje personal y envia el enlace al instante.", ["pastel de cumpleanos virtual", "torta de cumpleanos online", "enviar pastel virtual"]],
  ["/bn/virtual-janmadin-cake", "Virtual Janmadin Cake | Free Online Birthday Cake", "Create a free virtual birthday cake online, add a message, and share it instantly with one link.", ["virtual janmadin cake", "birthday cake online", "free virtual cake"]],
].map(([pathName, title, description, keywords]) => ({
  path: pathName,
  title,
  description,
  keywords,
  kind: "webpage",
  priority: "0.72",
  changefreq: "monthly",
}));

const blogRoutes = [
  {
    path: "/blog",
    title: "Flower Blog | Bouquet Ideas, Messages and Digital Gifting Guides",
    description:
      "Read practical guides on flower meanings, bouquet notes, apology messages, birthday ideas, Mother's Day gifts, and digital gifting tips.",
    keywords: [
      "flower blog",
      "bouquet message ideas",
      "digital gifting ideas",
      "flower meanings",
      "mothers day flowers",
    ],
    kind: "blog",
    priority: "0.8",
    changefreq: "weekly",
  },
  ...blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    kind: "blogPost",
    post,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: post.updatedAt || post.publishedAt || LASTMOD,
  })),
];

const routes = [
  ...appRoutes,
  ...bouquetKeywordRoutes,
  ...mothersDayKeywordRoutes,
  ...cakeKeywordRoutes,
  ...blogRoutes,
];

function absoluteUrl(routePath) {
  return routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
}

function fullTitle(title) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function breadcrumbsFor(meta) {
  if (meta.path === "/") return [];
  const items = [
    { name: "Home", item: SITE_URL },
  ];

  if (meta.kind === "blogPost") {
    items.push({ name: "Blog", item: `${SITE_URL}/blog` });
  }

  items.push({ name: meta.post?.title || meta.title, item: absoluteUrl(meta.path) });
  return items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.item,
  }));
}

function schemaFor(meta) {
  const pageUrl = absoluteUrl(meta.path);
  const publisher = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
  };

  const graph = [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: LOGO_URL,
      description: "Free online tools for creating and sharing digital bouquets, cards, hugs, and virtual cakes.",
    },
  ];

  if (meta.path === "/") {
    graph.push({
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: meta.description,
      inLanguage: "en",
    });
  }

  if (meta.kind === "application") {
    graph.push({
      "@type": "WebApplication",
      name: meta.title,
      url: pageUrl,
      description: meta.description,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    });
  } else if (meta.kind === "blog") {
    graph.push({
      "@type": "Blog",
      name: meta.title,
      url: pageUrl,
      description: meta.description,
      publisher,
    });
    graph.push({
      "@type": "ItemList",
      itemListElement: blogPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    });
  } else if (meta.kind === "blogPost") {
    const sections = meta.post?.sections || [];
    graph.push({
      "@type": "BlogPosting",
      headline: meta.post.title,
      description: meta.post.description,
      datePublished: meta.post.publishedAt,
      dateModified: meta.post.updatedAt || meta.post.publishedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl,
      },
      author: publisher,
      publisher,
      image: LOGO_URL,
      wordCount: sections.reduce(
        (total, section) => total + section.paragraphs.join(" ").split(/\s+/).filter(Boolean).length,
        0,
      ),
      articleSection: "Flower Gifting",
      inLanguage: "en-US",
    });
  } else {
    graph.push({
      "@type": "WebPage",
      name: meta.title,
      url: pageUrl,
      description: meta.description,
      inLanguage: "en",
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    });
  }

  if (meta.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: meta.faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    });
  }

  const breadcrumbs = breadcrumbsFor(meta);
  if (breadcrumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs,
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function seoHead(meta) {
  const title = fullTitle(meta.title);
  const canonical = absoluteUrl(meta.path);
  const keywords = Array.isArray(meta.keywords) ? meta.keywords.join(", ") : "";
  const robots = "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";
  const jsonLd = JSON.stringify(schemaFor(meta));

  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    `<meta name="keywords" content="${escapeAttr(keywords)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    `<meta property="og:type" content="${meta.kind === "blogPost" ? "article" : "website"}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `<meta property="og:image" content="${LOGO_URL}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    `<meta name="twitter:image" content="${LOGO_URL}" />`,
    `<script type="application/ld+json" data-seo-ld="page">${jsonLd}</script>`,
  ].join("\n  ");
}

function cleanHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+(?:name|property)=["'](?:description|keywords|robots|twitter:card|twitter:title|twitter:description|twitter:image|og:type|og:site_name|og:title|og:description|og:url|og:image|og:image:alt|og:locale)["'][\s\S]*?>\s*/gi, "")
    .replace(/<link\s+rel=["']canonical["'][\s\S]*?>\s*/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");
}

function htmlForRoute(baseHtml, meta) {
  return cleanHead(baseHtml)
    .replace(/<html[^>]*>/i, `<html lang="${meta.lang || "en"}">`)
    .replace("</head>", `  ${seoHead(meta)}\n</head>`);
}

function outputFileForRoute(routePath) {
  if (routePath === "/") return path.join(DIST, "index.html");
  const cleanPath = routePath.replace(/^\/+|\/+$/g, "");
  return path.join(DIST, cleanPath, "index.html");
}

function sitemapXml() {
  const urls = routes
    .map((meta) => {
      const loc = absoluteUrl(meta.path);
      const lastmod = meta.lastmod || LASTMOD;
      return [
        "  <url>",
        `    <loc>${escapeHtml(loc)}</loc>`,
        `    <lastmod>${escapeHtml(lastmod)}</lastmod>`,
        `    <changefreq>${meta.changefreq || "monthly"}</changefreq>`,
        `    <priority>${meta.priority || "0.7"}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

async function writeRouteHtml(baseHtml, meta) {
  const outputFile = outputFileForRoute(meta.path);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, htmlForRoute(baseHtml, meta), "utf8");
}

async function main() {
  const baseHtml = await readFile(path.join(DIST, "index.html"), "utf8");

  await Promise.all(routes.map((meta) => writeRouteHtml(baseHtml, meta)));
  await writeFile(path.join(DIST, "sitemap.xml"), sitemapXml(), "utf8");

  console.log(`SEO postbuild generated ${routes.length} route HTML files and sitemap.xml`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
