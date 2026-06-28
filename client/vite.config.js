import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    watch: {
      ignored: ["**/node_modules/**", "**/.vercel/**", "**/.git/**", "**/dist/**"],
    },
  },
});
