import { defineConfig, type UserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const uiSrc = fileURLToPath(new URL("./packages/ui/src", import.meta.url));

export default defineConfig({
  // Vitest bundles its own copy of Vite, so its `PluginOption` type differs from
  // the one `@vitejs/plugin-react` is authored against. The runtime value is
  // correct; cast only to satisfy the duplicated type identity.
  plugins: [react()] as unknown as UserConfig["plugins"],
  resolve: {
    alias: {
      "@personal-ui/ui": `${uiSrc}/index.ts`,
      "@personal-ui/ui/": `${uiSrc}/`,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["packages/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["packages/ui/src/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/index.ts", "**/*.d.ts"],
    },
  },
});
