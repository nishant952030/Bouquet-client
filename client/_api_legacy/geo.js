export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const country =
    req.headers["x-vercel-ip-country"] ||
    req.headers["x-country-code"] ||
    req.headers["cf-ipcountry"] ||
    "IN";

  return res.status(200).json({
    country: String(country || "IN").toUpperCase(),
  });
}
