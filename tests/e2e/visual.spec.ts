import { test, expect, type Page } from "@playwright/test";

// Responsive visual regression for the layout components whose chrome changes
// with the viewport (Navbar, Sidebar, Stepper). Chromium only, so the committed
// baselines stay stable across engines; a 1% pixel tolerance absorbs sub-pixel
// font rasterisation while still catching real layout regressions.

const VIEWPORTS: [name: string, width: number, height: number][] = [
  ["desktop", 1440, 900],
  ["tablet", 834, 1112],
  ["mobile", 390, 844],
];

const COMPONENTS: [id: string, name: string][] = [
  ["navbar", "Navbar"],
  ["sidebar", "Sidebar"],
  ["stepper", "Stepper"],
];

async function prepare(page: Page, id: string, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/#/components/${id}`);
  // The lab's own chrome would squeeze the demo on narrow viewports; the visual
  // gate is about the component, not the shell.
  await page.addStyleTag({ content: ".lab-sidebar { display: none; }" });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

test.describe("visual regression — responsive layout components", () => {
  test.skip(
    ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
    "Baselines are desktop chromium-only",
  );

  for (const [id, name] of COMPONENTS) {
    for (const [viewport, width, height] of VIEWPORTS) {
      test(`${name} matches the ${viewport} baseline`, async ({ page }) => {
        await prepare(page, id, width, height);

        await expect(page.locator(".lab-canvas").first()).toHaveScreenshot(`${id}-${viewport}.png`, {
          animations: "disabled",
          caret: "hide",
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
});
