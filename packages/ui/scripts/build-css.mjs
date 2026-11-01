import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const srcDir = resolve(root, "src");
const distDir = resolve(root, "dist");

const IMPORT_RE = /@import\s+["']([^"']+)["']\s*;/g;
const seen = new Set();

/** Recursively inline @import statements so each entry becomes one file. */
function inline(file, stack = []) {
  const abs = resolve(file);
  if (stack.includes(abs)) {
    throw new Error(`Circular @import detected: ${[...stack, abs].join(" -> ")}`);
  }
  if (!existsSync(abs)) {
    throw new Error(`Missing CSS file: ${abs}`);
  }
  const raw = readFileSync(abs, "utf8");
  seen.add(abs);
  return raw.replace(IMPORT_RE, (_, spec) => {
    if (/^https?:/.test(spec)) return `@import "${spec}";`;
    return inline(resolve(dirname(abs), spec), [...stack, abs]);
  });
}

function write(entry, out) {
  const css = inline(resolve(srcDir, entry));
  const banner = `/* @adem.rejeb/ui — generated from ${entry}. Do not edit directly. */\n`;
  mkdirSync(distDir, { recursive: true });
  writeFileSync(resolve(distDir, out), banner + css, "utf8");
  process.stdout.write(`  ✓ dist/${out}\n`);
}

console.log("@adem.rejeb/ui: building CSS entries");
write("styles/index.css", "styles.css");
write("tokens/tokens.css", "tokens.css");
console.log(`@adem.rejeb/ui: inlined ${seen.size} source files`);
