"use client";

import React, { Suspense, useEffect, useState } from "react";
import { initGoogleAnalytics } from "../src/lib/analytics";
import FloatingCart from "../src/components/FloatingCart";
import FeedbackWidget from "../src/components/FeedbackWidget";

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
      {children}
      <FloatingCart />
      <FeedbackWidget />
    </Suspense>
  );
}
