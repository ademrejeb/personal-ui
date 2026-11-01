/**
 * Generates docs/manifest.json — a machine-readable index of every documented
 * component, derived from the component-lab registry so it can never drift.
 *
 * Usage: npm run manifest
 */
import { build } from "esbuild";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outdir = mkdtempSync(path.join(tmpdir(), "ui-manifest-"));
const bundlePath = path.join(outdir, "registry.mjs");

await build({
  absWorkingDir: root,
  entryPoints: [path.join(root, "apps/component-lab/src/registry/index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  jsx: "automatic",
  outfile: bundlePath,
  logLevel: "silent",
  define: { "process.env.NODE_ENV": '"production"' },
});

const { registry, CATEGORY_ORDER } = await import(pathToFileURL(bundlePath).href);

const entries = registry
  .map((entry) => ({
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description: entry.description,
    ...(entry.keywords?.length ? { keywords: [...entry.keywords] } : {}),
    ...(entry.props?.length ? { props: entry.props.map((prop) => ({ ...prop })) } : {}),
    ...(entry.notes?.length ? { notes: [...entry.notes] } : {}),
  }))
  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

const manifest = {
  $schema: "https://ui.local/schemas/manifest.v1.json",
  name: "@personal-ui/ui",
  version: JSON.parse(
    (await import("node:fs")).readFileSync(path.join(root, "packages/ui/package.json"), "utf8"),
  ).version,
  generatedBy: "scripts/build-manifest.mjs",
  categories: CATEGORY_ORDER,
  count: entries.length,
  components: entries,
};

mkdirSync(path.join(root, "docs"), { recursive: true });
writeFileSync(
  path.join(root, "docs/manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote docs/manifest.json (${entries.length} components).`);
