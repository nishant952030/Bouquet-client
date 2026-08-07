export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/payment", "/payment-*", "/view/", "/admin", "/claim/", "/api/", "/shagun/success/"],
    },
    sitemap: "https://www.petalsandwords.com/sitemap.xml",
  };
}
