import { expect, test, type Page } from "@playwright/test";

async function setResourceHints(page: Page, cores: number, memory: number) {
  await page.addInitScript(
    ({ hardwareConcurrency, deviceMemory }) => {
      Object.defineProperty(window.navigator, "hardwareConcurrency", {
        configurable: true,
        value: hardwareConcurrency,
      });
      Object.defineProperty(window.navigator, "deviceMemory", {
        configurable: true,
        value: deviceMemory,
      });
    },
    { hardwareConcurrency: cores, deviceMemory: memory },
  );
}

async function simulateSustainedSlowFrames(page: Page) {
  await page.addInitScript(() => {
    window.requestAnimationFrame = (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 50);
    window.cancelAnimationFrame = (handle: number) => window.clearTimeout(handle);
  });
}

test.describe("Learn journey lifecycle", () => {
  test("scene and floating UI stop before later Learn content", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium");
    await setResourceHints(page, 8, 8);
    await page.goto("/learn");

    const main = page.locator(".page-main--hiw-experience");
    const act = page.locator("#full-journey");
    await expect(main).toHaveAttribute("data-journey-mode", "immersive");

    const transform = await page.locator("[data-scroll-content]").evaluate(
      (element) => getComputedStyle(element).transform,
    );
    expect(transform).toBe("none");

    const actTop = await act.evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    await page.evaluate(
      ({ top, height }) => window.scrollTo(0, top - height * 1.5),
      { top: actTop, height: viewportHeight },
    );

    await expect(
      page.locator('.scene-stage[data-journey-active="false"]'),
    ).toHaveCount(1);
    await expect(page.locator(".plate-stage__fx")).toHaveAttribute("width", "1");

    await page.evaluate(
      ({ top, viewportHeight }) => window.scrollTo(0, top - viewportHeight / 2),
      { top: actTop, viewportHeight },
    );

    await expect(
      page.locator('.scene-stage[data-journey-active="true"]'),
    ).toHaveCount(1);
    await expect(page.locator(".stage-graphic")).toHaveCount(0);
    await expect(page.locator("[data-journey-hud]")).toHaveCount(0);

    await page.evaluate((top) => window.scrollTo(0, top + 8), actTop);

    await expect(
      page.locator('.scene-stage[data-journey-active="true"]'),
    ).toHaveCount(1);
    await expect(page.locator(".stage-graphic")).toHaveCount(1);
    await expect(page.locator("[data-journey-hud]")).toHaveCount(1);

    await page.locator("#faq").evaluate((element) => element.scrollIntoView());

    await expect(
      page.locator('.scene-stage[data-journey-active="true"]'),
    ).toHaveCount(0);
    await expect(page.locator(".stage-graphic")).toHaveCount(0);
    await expect(page.locator("[data-journey-hud]")).toHaveCount(0);
  });

  test("resource-constrained laptops receive the complete static path", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium");
    await setResourceHints(page, 2, 2);
    await page.goto("/learn");

    await expect(page.locator(".page-main--hiw-experience")).toHaveAttribute(
      "data-journey-mode",
      "static",
    );
    await expect(page.locator("#full-journey")).toHaveAttribute("data-static", "true");
    await expect(page.locator(".hiw-explainer")).not.toHaveClass(/visually-hidden/);
    await expect(page.locator(".hiw-explainer__card")).toHaveCount(6);
  });

  test("sustained poor frame rate falls back to the static path", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium");
    await setResourceHints(page, 8, 8);
    await simulateSustainedSlowFrames(page);
    await page.goto("/learn");

    const main = page.locator(".page-main--hiw-experience");
    const act = page.locator("#full-journey");
    await expect(main).toHaveAttribute("data-journey-mode", "immersive");

    const actTop = await act.evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );
    await page.evaluate((top) => window.scrollTo(0, top + 8), actTop);

    await expect(main).toHaveAttribute("data-performance-fallback", "true", {
      timeout: 10_000,
    });
    await expect(main).toHaveAttribute("data-journey-mode", "static");
    await expect(page.locator(".hiw-explainer")).not.toHaveClass(/visually-hidden/);
  });
});
