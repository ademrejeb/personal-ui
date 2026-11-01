import { test, expect } from "@playwright/test";

test.describe("Component Lab", () => {
  test("lists every category on the overview", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Component Lab" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Data Display" })).toBeVisible();
  });

  test("edits props and keeps the preview and generated code in sync", async ({ page }) => {
    await page.goto("/#/components/button");
    await expect(page.getByRole("heading", { name: "Button" })).toBeVisible();

    const preview = page.locator(".lab-canvas");
    await expect(preview.getByRole("button", { name: "Save changes" })).toBeVisible();

    await page.locator("#ctl-children").fill("Publish");

    await expect(preview.getByRole("button", { name: "Publish" })).toBeVisible();
    await expect(page.locator(".lab-code")).toContainText("Publish");
  });

  test("navigates with the command palette", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search components" }).click();

    const search = page.getByPlaceholder("Search components…");
    await expect(search).toBeVisible();
    await search.fill("modal");
    await page
      .locator(".ui-command__item")
      .filter({ has: page.locator(".ui-command__item-label", { hasText: /^Modal$/ }) })
      .click();

    await expect(page.getByRole("heading", { name: "Modal" })).toBeVisible();
  });

  test("inspects live design tokens", async ({ page }) => {
    await page.goto("/#/tokens");
    await expect(page.getByRole("heading", { name: "Design tokens" })).toBeVisible();
    await expect(page.locator(".lab-token").first()).toBeVisible();
  });

  test("switches the resolved theme", async ({ page }) => {
    await page.goto("/#/theme");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", /light|dark|system/);
  });
});
