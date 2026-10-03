"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initGoogleAnalytics, trackPageView } from "../src/lib/analytics";
import { trackPageViewFirestore } from "../src/lib/tracker";
import FloatingCart from "../src/components/FloatingCart";
import FeedbackWidget from "../src/components/FeedbackWidget";

function AppTrafficTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef(null);

  useEffect(() => {
    if (!pathname) return;
    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    if (lastPath.current === fullPath) return;
    lastPath.current = fullPath;

    trackPageView(fullPath);
    trackPageViewFirestore(fullPath);
  }, [pathname, searchParams]);

  return null;
}

export default function ClientProviders({ children }) {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Dynamic import forces i18n to only load on the client side (prevents build SSR hangs)
    import("../src/lib/i18n").then(() => {
      setI18nReady(true);
    });
    initGoogleAnalytics();
  }, []);

  if (!i18nReady) {
    return (
      <div
        suppressHydrationWarning
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Manrope', sans-serif",
          color: "#7b5455",
          fontSize: "0.9rem",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          suppressHydrationWarning
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Manrope', sans-serif",
            color: "#7b5455",
            fontSize: "0.9rem",
          }}
        >
          Loading…
        </div>
      }
    >
      <Suspense fallback={null}>
        <AppTrafficTracker />
      </Suspense>
      {children}
      <FloatingCart />
      <FeedbackWidget />
    </Suspense>
  );
}
