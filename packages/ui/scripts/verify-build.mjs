/**
 * Guards the published artifact contract:
 * - the bundle starts with the "use client" directive (Next.js App Router),
 * - every file referenced by package.json `exports` exists.
 *
 * Runs as the last step of `npm run build`.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const bundlePath = resolve(root, "dist/index.js");
const bundle = readFileSync(bundlePath, "utf8").replace(/^\uFEFF/, "");
if (!/^["']use client["'];/.test(bundle.trimStart())) {
  throw new Error('dist/index.js must start with "use client"; — Next.js will treat the library as server-only.');
}

const targets = new Set();
for (const value of Object.values(pkg.exports ?? {})) {
  if (typeof value === "string") targets.add(value);
  else if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      if (typeof nested === "string" && nested !== "./package.json") targets.add(nested);
    }
  }
}

for (const target of targets) {
  const file = resolve(root, target);
  if (!existsSync(file)) {
    throw new Error(`package.json exports points at a missing file: ${target}`);
  }
}

process.stdout.write(`  ✓ artifact contract (use client + ${targets.size} export targets)\n`);
