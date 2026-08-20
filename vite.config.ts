import fs from "node:fs";
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/** GitHub Pages serves 404.html for unknown paths — emit the SPA shell so
 *  deep links (e.g. /taleorience-web/projects/:id) boot the router. */
function spaFallback(): Plugin {
  return {
    name: "spa-fallback-404",
    closeBundle() {
      const indexHtml = path.resolve(import.meta.dirname, "dist", "index.html");
      const notFoundHtml = path.resolve(import.meta.dirname, "dist", "404.html");
      fs.copyFileSync(indexHtml, notFoundHtml);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
