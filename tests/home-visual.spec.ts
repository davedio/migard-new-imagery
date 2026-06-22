import { expect, test } from "@playwright/test";

test("home hero and path cards render cleanly", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:motion", "on");
  });

  await page.goto("/");

  await expect(page.locator(".splash--overlay")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /enter/i })).toHaveCount(0);

  await expect(
    page.getByRole("heading", {
      name: /The secure scaling layer for UTXO finance/i,
    }),
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
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operators", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Watchers", exact: true })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("paths.png") });
});

test("desktop nav opens persistent child page menu", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop dropdown behavior only");

  await page.goto("/");

  const learn = page.getByRole("button", { name: /Learn/i });
  await learn.click();

  const dropdown = page.locator(".site-nav__group", { has: learn }).locator(".site-nav__dropdown");
  await expect(dropdown.getByRole("link", { name: /Learn overview/i })).toBeVisible();
  await expect(dropdown.getByRole("link", { name: /Security/i })).toBeVisible();
  await expect(dropdown.getByRole("link", { name: /FAQ/i })).toBeVisible();
  await expect(learn).toHaveAttribute("aria-expanded", "true");

  await page.mouse.move(80, 820);
  await expect(dropdown.getByRole("link", { name: /Security/i })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("nav-learn-open.png") });
});

test("learn overview page renders the agreed language map", async ({ page }, testInfo) => {
  await page.goto("/learn");

  await expect(page.getByRole("heading", { name: /Learn Midgard/i })).toBeVisible();
  await expect(page.getByText(/The secure scaling layer for UTXO finance/i)).toBeVisible();
  await expect(page.getByText(/Deposit, transact, withdraw/i)).toBeVisible();
  await expect(page.getByText(/Submit, sequence, commit, DA attestation, watch, settle/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operators", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Watchers", exact: true })).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("fault-proof");
  expect(bodyText).not.toContain("fraud-proof");
  expect(bodyText).not.toContain("Bitcoin DeFi");

  await page.screenshot({ path: testInfo.outputPath("learn.png") });
});

test("how it works lifecycle language renders cleanly", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:motion", "off");
  });

  await page.goto("/how-it-works");

  await expect(page.getByRole("heading", { name: /Flow of a transaction/i })).toBeVisible();
  await expect(page.locator(".hiw-act__beats").getByText("DA attestation")).toBeVisible();
  await expect(page.locator(".hiw-act__lead").getByText(/deposit, transact, withdraw/i)).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("final L1 settlement");
  expect(bodyText).toContain("fault-proof");
  expect(bodyText).not.toContain("fraud-proof");
  expect(bodyText).not.toContain("fraud proof");

  await page.screenshot({ path: testInfo.outputPath("how-it-works.png") });
});

test("security and faq pages render", async ({ page }, testInfo) => {
  await page.goto("/security");
  await expect(page.getByRole("heading", { name: /Security you can inspect/i })).toBeVisible();
  await expect(page.getByText(/mathematically verified smart contracts/i).first()).toBeVisible();
  await expect(page.getByText(/fault-proof verification/i).first()).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: testInfo.outputPath("security.png") });

  await page.goto("/faq");
  await expect(page.getByRole("heading", { name: /Questions, answered plainly/i })).toBeVisible();
  await expect(page.getByText(/Compare the trust model/i)).toBeVisible();
  await expect(page.getByText(/Often depends on a bridge/i)).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: testInfo.outputPath("faq.png") });
});
