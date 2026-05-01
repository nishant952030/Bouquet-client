import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import { initGoogleAnalytics } from "./lib/analytics";
import "./lib/i18n"; // ← side-effect: initializes i18next before first render
import "./index.css";

initGoogleAnalytics();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
      <App />
    </Suspense>
    <Analytics />
  </React.StrictMode>
);
