import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * The JavaScript/TypeScript bundle only. Global, token-driven CSS is emitted
 * separately by scripts/build-css.mjs so consumers can import `styles.css`
 * (full theme) or `tokens.css` (tokens only) explicitly.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "lucide-react"],
      output: {
        preserveModules: false,
        // Next.js App Router treats every export as a Client Component unless the
        // entry declares the directive. The whole library is hook-driven, so one
        // banner on the single bundle is correct and keeps the build simple.
        banner: '"use client";',
      },
    },
  },
});
