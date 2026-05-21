import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function htmlImportFallback() {
  return {
    name: "html-import-fallback",
    enforce: "pre",
    load(id) {
      if (/\.html\?(?:.*&)?import(?:&|$)/.test(id)) {
        return 'export default "";';
      }
      return null;
    },
    transform(code, id) {
      if (/\.html(?:\?|$)/.test(id) && /^\s*<!doctype html>/i.test(code)) {
        return 'export default "";';
      }
      return null;
    },
  };
}

export default defineConfig({
  assetsInclude: ["**/*.html"],
  plugins: [htmlImportFallback(), react(), tailwindcss()],
});
