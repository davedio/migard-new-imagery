import { expect, test } from "@playwright/test";

test("home hero and ecosystem partners render cleanly", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:motion", "on");
  });

  await page.goto("/");

  const enter = page.getByRole("button", { name: /enter/i });
  if ((await enter.count()) > 0) {
    await enter.first().click();
  }

  await expect(page.getByRole("heading", { name: /Built to scale/i })).toBeVisible();
  const bodyText = await page.locator("body").innerText();
  for (const hiddenLabel of [
    "Surface",
    "Canopy",
    "Roots",
    "Trunk",
    "Bedrock",
    "Root confirms",
    "Confirmed root",
    "Take root",
    "Rooted in Cardano",
    "root of trust",
    "Cardano L1 block",
    "L2 throughput",
    "Latest proof",
    "SIMULATED · LIVE AT LAUNCH",
  ]) {
    expect(bodyText).not.toContain(hiddenLabel);
  }
  await expect(page.locator(".v2-hero-logo img")).toHaveCount(5);
  await page.waitForTimeout(1_500);
  await page.screenshot({ path: testInfo.outputPath("hero.png") });

  await page.locator(".v2-partners").scrollIntoViewIfNeeded();
  await expect(page.locator(".v2-partners a")).toHaveCount(0);
  await expect(page.locator(".v2-partner img")).toHaveCount(10);
  await expect(page.locator('.v2-partner img[src*="artifi-labs"]')).toHaveCount(2);

  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".v2-partner img")).every((node) => {
      const img = node as HTMLImageElement;
      return img.complete && img.naturalWidth > 0 && img.getBoundingClientRect().width > 0;
    }),
  );

  await page.screenshot({ path: testInfo.outputPath("partners.png") });
});
