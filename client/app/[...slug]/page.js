"use client";

import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("./client-app-fallback"), {
  ssr: false,
});

export default function CatchAllPage() {
  return <ClientApp />;
}
