import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const uiSrc = fileURLToPath(new URL("../../packages/ui/src", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve the design system to source so the lab always reflects the
    // working tree (no need to rebuild `dist` before running the playground).
    alias: [
      { find: "@adem.rejeb/ui/styles.css", replacement: `${uiSrc}/styles/index.css` },
      { find: "@adem.rejeb/ui/tokens.css", replacement: `${uiSrc}/tokens/tokens.css` },
      { find: "@adem.rejeb/ui", replacement: `${uiSrc}/index.ts` },
    ],
  },
  server: { port: 5173 },
  preview: { port: 4173, strictPort: true },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) {
            return "react";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          if (id.includes("packages/ui/src") || id.includes("packages\\ui\\src")) {
            return "ui";
          }
          return undefined;
        },
      },
    },
  },
});
