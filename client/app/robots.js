export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/claim/", "/api/", "/shagun/success/"],
    },
    sitemap: "https://www.petalsandwords.com/sitemap.xml",
  };
}
