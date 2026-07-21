import { expect, test } from "@playwright/test";

const THEME_KEY = "midgard:theme";

test("the brand default is dark and the lifecycle reads Execute to Verify to Settle", async (
  { page },
  testInfo,
) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.addInitScript((key) => window.localStorage.removeItem(key), THEME_KEY);
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".site-nav__theme")).toHaveAttribute(
    "aria-label",
    "Switch to light mode",
  );

  const preview = page.locator("[data-descent-preview]");
  await preview.scrollIntoViewIfNeeded();
  const previewTree = preview.locator("[data-signature-tree]");
  await expect(previewTree).toBeVisible();
  await expect
    .poll(() => previewTree.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect
    .poll(() => previewTree.evaluate((image: HTMLImageElement) => image.currentSrc))
    .toContain("/dark/img/tree/tree-hero-vista-");

  const lifecycle = preview.locator("[data-lifecycle-stage]");
  await expect(lifecycle).toHaveAttribute("data-lifecycle-stage", "execute");
  await expect(lifecycle).toHaveAttribute("data-lifecycle-stage", "verify", {
    timeout: 4_500,
  });
  await expect(lifecycle).toHaveAttribute("data-lifecycle-stage", "settle", {
    timeout: 4_500,
  });
});

test("a stored light preference remains authoritative and the toggle still switches modes", async (
  { page },
  testInfo,
) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.addInitScript(
    ({ key, theme }) => window.localStorage.setItem(key, theme),
    { key: THEME_KEY, theme: "light" },
  );
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".site-nav__theme")).toHaveAttribute(
    "aria-label",
    "Switch to dark mode",
  );

  const previewTree = page.locator("[data-signature-tree]");
  await previewTree.scrollIntoViewIfNeeded();
  await expect
    .poll(() => previewTree.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect
    .poll(() => previewTree.evaluate((image: HTMLImageElement) => image.currentSrc))
    .toContain("/img/tree/tree-hero-vista-");
  expect(await previewTree.evaluate((image: HTMLImageElement) => image.currentSrc)).not.toContain(
    "/dark/",
  );

  await page.locator(".site-nav__theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), THEME_KEY))
    .toBe("dark");
  await expect
    .poll(() => previewTree.evaluate((image: HTMLImageElement) => image.currentSrc))
    .toContain("/dark/img/tree/tree-hero-vista-");
});

test("reduced motion keeps the complete lifecycle visible without the loop", async (
  { page },
  testInfo,
) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    ({ key, theme }) => window.localStorage.setItem(key, theme),
    { key: THEME_KEY, theme: "light" },
  );
  await page.goto("/");

  const preview = page.locator("[data-descent-preview]");
  await preview.scrollIntoViewIfNeeded();
  await expect(preview).toHaveAttribute("data-motion", "off");
  await expect(preview.locator("p").filter({ hasText: /Execute, verify, and settle/i })).toBeVisible();
  await expect(preview.locator("[data-lifecycle-label]")).toHaveCount(3);
  const labelOpacities = await preview.locator("[data-lifecycle-label]").evaluateAll((labels) =>
    labels.map((label) => getComputedStyle(label).opacity),
  );
  expect(labelOpacities).toEqual(["1", "1", "1"]);

  const canvas = preview.locator("canvas");
  const lightFrame = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.locator(".site-nav__theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(lightFrame);
});

test("the signature-tree preview stays contained on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");
  await page.goto("/");

  const preview = page.locator("[data-descent-preview]");
  await preview.scrollIntoViewIfNeeded();
  await expect(preview.locator("[data-signature-tree]")).toBeVisible();
  await expect
    .poll(() =>
      preview
        .locator("[data-signature-tree]")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  const box = await preview.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
});
