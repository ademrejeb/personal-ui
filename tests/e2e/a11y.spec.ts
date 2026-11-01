import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const AXE_PATH = "node_modules/axe-core/axe.min.js";

interface AxeNode {
  target: string[];
  html: string;
  failureSummary?: string;
}

interface AxeViolation {
  id: string;
  impact?: string | null;
  help: string;
  nodes: AxeNode[];
}

const AXE_OPTIONS = {
  rules: {
    // The lab is a single-page shell with one <main>. Several demos legitimately
    // render their own <main> (e.g. PageShell) inside it, so document-level
    // landmark uniqueness/top-level rules can never hold here. Contrast, names,
    // roles, ARIA and structure rules all stay enabled.
    "landmark-no-duplicate-main": { enabled: false },
    "landmark-main-is-top-level": { enabled: false },
    "landmark-unique": { enabled: false },
  },
};

async function audit(page: Page): Promise<AxeViolation[]> {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async (options) => {
    const axe = (
      window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: AxeViolation[] }> } }
    ).axe;
    const results = await axe.run(document, options);
    return results.violations as AxeViolation[];
  }, AXE_OPTIONS);
}

function describeViolations(violations: AxeViolation[]): string {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes.map((node) => `  - ${node.target.join(" ")}`).join("\n"),
    )
    .join("\n\n");
}

async function expectNoViolations(page: Page): Promise<void> {
  const violations = await audit(page);
  const summary = violations.map(
    (violation) => `${violation.id} :: ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`,
  );
  expect(summary, describeViolations(violations)).toEqual([]);
}

// A curated cross-family sample, asserted in every browser project.
const ROUTES: [name: string, hash: string][] = [
  ["overview", "/"],
  ["button", "/#/components/button"],
  ["forms", "/#/components/form"],
  ["data table", "/#/components/data-table"],
  ["calendar", "/#/components/calendar"],
  ["modal", "/#/components/modal"],
  ["navigation", "/#/components/navbar"],
  ["tokens", "/#/tokens"],
  ["theme", "/#/theme"],
];

test.describe("accessibility (axe)", () => {
  for (const [name, hash] of ROUTES) {
    test(`has no detectable violations on the ${name} page`, async ({ page }) => {
      await page.goto(hash);
      await page.waitForLoadState("networkidle");

      await expectNoViolations(page);
    });
  }
});

// Full manifest sweep, run once (a11y results do not vary by engine).
const manifest = JSON.parse(readFileSync("docs/manifest.json", "utf8")) as { components: { id: string; name: string }[] };

test.describe("accessibility (axe) — every component", () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "Full sweep runs once on desktop chromium",
  );

  for (const component of manifest.components) {
    test(`has no detectable violations for ${component.name}`, async ({ page }) => {
      await page.goto(`/#/components/${component.id}`);
      await page.waitForLoadState("networkidle");

      await expectNoViolations(page);
    });
  }
});
