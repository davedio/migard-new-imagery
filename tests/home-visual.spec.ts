import { expect, test } from "@playwright/test";

test("home hero and path cards render cleanly", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:motion", "on");
  });

  await page.goto("/");

  await expect(page.locator(".splash--overlay")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /enter/i })).toHaveCount(0);

  await expect(
    page.getByRole("heading", { name: /The execution layer for UTXO finance/i }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      page.locator("#top .v2-band__hero > div").first().evaluate((node) => {
        return Number.parseFloat(window.getComputedStyle(node).opacity);
      }),
    )
    .toBeGreaterThan(0.99);
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
    "Trust rooted in Cardano",
    "settlement and trust",
    "Cardano apps",
    "Cardano applications",
    "Cardano L1 block",
    "L2 throughput",
    "Latest proof",
    "SIMULATED · LIVE AT LAUNCH",
  ]) {
    expect(bodyText).not.toContain(hiddenLabel);
  }
  await expect(
    page.locator("#top").getByRole("link", { name: /Choose your path/i }),
  ).toBeVisible();
  await page.waitForTimeout(1_500);
  await page.screenshot({ path: testInfo.outputPath("hero.png") });

  await page.locator("#top").getByRole("link", { name: /Choose your path/i }).click();
  await page.waitForTimeout(1_000);
  await expect(page.getByRole("heading", { name: "Choose your path." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Builders" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operators" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Watchers" })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("paths.png") });
});

test("how it works lifecycle language renders cleanly", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:motion", "off");
  });

  await page.goto("/how-it-works");

  await expect(page.getByRole("heading", { name: /Flow of a transaction/i })).toBeVisible();
  await expect(page.locator(".hiw-act__beats").getByText("DA attestation")).toBeVisible();
  await expect(page.getByText(/deposit, transact, withdraw/i)).toBeVisible();
  await expect(page.getByText(/fault-proof design/i)).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("final settlement rooted in Cardano");
  expect(bodyText).not.toContain("fraud-proof");
  expect(bodyText).not.toContain("fraud proof");

  await page.screenshot({ path: testInfo.outputPath("how-it-works.png") });
});
