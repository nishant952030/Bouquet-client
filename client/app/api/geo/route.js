import { NextResponse } from "next/server";

export async function GET(request) {
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    request.headers.get("cf-ipcountry") ||
    "IN";

  return NextResponse.json({
    country: String(country || "IN").toUpperCase(),
  });
}
