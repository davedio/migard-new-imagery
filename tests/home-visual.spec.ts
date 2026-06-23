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
  await expect(page.locator("#top").getByText(/mathematically verified smart contracts/i)).toBeVisible();
  await expect(page.locator(".v2-home__instant-plate")).toHaveCSS(
    "background-image",
    /worldtree-night-tall/,
  );
  await expect(page.locator(".v2-stage")).toBeVisible();
  await expect(page.locator(".v2-stage canvas")).toHaveCount(2);
  await expect(page.locator(".v2-marquee")).toHaveCount(0);
  await expect(page.locator(".v2-rail")).toHaveCount(0);
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
  await expect(page.getByRole("link", { name: /Choose your path/i }).first()).toBeVisible();
  await page.waitForTimeout(1_500);
  await page.screenshot({ path: testInfo.outputPath("hero.png") });

  const pathSection = page.locator("#trunk");
  await expect(pathSection.getByRole("heading", { name: "Choose your path." })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Protocol Roles", exact: true })).toBeVisible();
  await expect(pathSection.getByText(/Operators & Watchers keep Midgard running and verifiable/i)).toBeVisible();
  await expect(pathSection.getByRole("link", { name: /Start as a user/i })).toHaveAttribute("href", "/learn#roles");
  await expect(pathSection.getByRole("link", { name: /Explore protocol roles/i })).toHaveAttribute("href", "/developers#developer-paths");
  await expect(pathSection.getByRole("heading", { name: /Fast action first/i })).toBeVisible();
  await expect(pathSection.locator(".v2-protocol__step")).toHaveCount(5);
  await expect(pathSection.getByText("Final settlement")).toBeVisible();

  await expect(page.locator(".v2-tile")).toHaveCount(6);
  await expect(page.locator(".v2-tile").filter({ hasText: "Soft confirmations" })).toBeVisible();
  await expect(page.locator(".v2-tile").filter({ hasText: "Fault-proof coverage" })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("paths.png") });
});

test("desktop nav opens persistent child page menu", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop dropdown behavior only");

  await page.goto("/");

  const learn = page.getByRole("button", { name: /Learn/i });
  await learn.click();

  const dropdown = page.locator(".site-nav__group", { has: learn }).locator(".site-nav__dropdown");
  await expect(dropdown.getByRole("link", { name: /Learn overview/i })).toBeVisible();
  await expect(dropdown.getByRole("link", { name: /How it works/i })).toBeVisible();
  await expect(dropdown.getByRole("link", { name: /FAQ/i })).toBeVisible();
  await expect(learn).toHaveAttribute("aria-expanded", "true");

  await page.mouse.move(80, 820);
  await expect(dropdown.getByRole("link", { name: /How it works/i })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("nav-learn-open.png") });
});

test("minimal preview renders tree-themed routing concept", async ({ page }, testInfo) => {
  await page.goto("/minimal");

  await expect(
    page.getByRole("heading", {
      name: /The secure scaling layer for UTXO finance/i,
    }),
  ).toBeVisible();
  await expect(
    page.locator(".minimal-hero__copy").getByText(/L1 security through mathematically verified smart contracts/i),
  ).toBeVisible();
  await expect(page.locator(".minimal-tree")).toBeVisible();
  await expect(page.locator(".minimal-tree__packet")).toHaveCount(2);
  await expect(page.getByText("Data availability check").first()).toBeVisible();

  const pathSection = page.locator("#paths");
  await expect(pathSection.getByRole("heading", { name: /Choose the path that matches your job/i })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Protocol Roles", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("link", { name: /Start as a user/i })).toHaveAttribute("href", "/learn#roles");
  await expect(pathSection.getByRole("link", { name: /Explore protocol roles/i })).toHaveAttribute("href", "/developers#developer-paths");

  await expect(page.locator(".minimal-metric")).toHaveCount(6);
  await expect(page.getByRole("heading", { name: /Inspect before you trust speed/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Security model/i })).toHaveAttribute("href", "/security");
  await expect(page.getByRole("link", { name: /Contract surface/i })).toHaveAttribute("href", "/contracts");
  await expect(page.getByRole("link", { name: /Source review/i })).toHaveAttribute("href", /github\.com\/Anastasia-Labs\/midgard/);
  await expect(page.locator(".minimal-card-grid--4 .minimal-card")).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath("minimal-preview.png") });
});

test("developers and security menus expose key routes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop dropdown behavior only");

  await page.goto("/");

  const developers = page.getByRole("button", { name: /Developers/i });
  await developers.click();
  const devDropdown = page.locator(".site-nav__group", { has: developers }).locator(".site-nav__dropdown");
  await expect(devDropdown.getByRole("link", { name: /Developer overview/i })).toBeVisible();
  await expect(devDropdown.getByRole("link", { name: /Contracts/i })).toBeVisible();
  await expect(devDropdown.getByRole("link", { name: /GitHub/i })).toBeVisible();

  const security = page.getByRole("button", { name: /^Security$/i });
  await security.click();
  const securityDropdown = page.locator(".site-nav__group", { has: security }).locator(".site-nav__dropdown");
  await expect(securityDropdown.getByRole("link", { name: /Security overview/i })).toBeVisible();
  await expect(securityDropdown.getByRole("link", { name: /Security policy/i })).toBeVisible();

  const channels = page.getByRole("button", { name: /^Channels$/i });
  await channels.click();
  const channelsDropdown = page.locator(".site-nav__group", { has: channels }).locator(".site-nav__dropdown");
  await expect(channelsDropdown.getByRole("link", { name: /Choose your path/i })).toBeVisible();
  await expect(channelsDropdown.getByRole("link", { name: /Discord/i })).toBeVisible();
  await expect(channelsDropdown.getByRole("link", { name: /Intake form/i })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("nav-developers-security-open.png") });
});

test("learn overview page renders the agreed language map", async ({ page }, testInfo) => {
  await page.goto("/learn");

  await expect(page.getByRole("heading", { name: /Learn Midgard/i })).toBeVisible();
  await expect(page.getByText(/The secure scaling layer for UTXO finance/i)).toBeVisible();
  await expect(page.getByText(/Deposit, transact, withdraw/i)).toBeVisible();
  await expect(page.getByText(/Submit, sequence, commit, data availability check, watch, settle/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Protocol Roles", exact: true })).toBeVisible();
  await expect(page.getByText(/Operators & Watchers keep Midgard running and verifiable/i)).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("fault-proof");
  expect(bodyText).not.toContain("fraud-proof");
  expect(bodyText).not.toContain("Bitcoin DeFi");

  await page.screenshot({ path: testInfo.outputPath("learn.png") });
});

test("developer and contracts pages render", async ({ page }, testInfo) => {
  await page.goto("/developers");
  await expect(page.getByRole("heading", { name: /Build on Midgard/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Start from the right page/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Whitepaper/i })).toBeVisible();
  await expect(page.locator("main").getByRole("heading", { name: /^Security$/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Application builders/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Inspect contracts/i }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("developers.png") });

  await page.goto("/contracts");
  await expect(page.getByRole("heading", { name: /Inspect the contract path/i })).toBeVisible();
  await expect(page.locator("[data-contracts-hero]")).toBeVisible();
  await expect(page.locator(".contracts-page .page-hero")).toHaveCount(0);
  await expect(page.locator("[data-contracts-hero]").getByText(/Validator topology/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /The protocol surface/i })).toBeVisible();
  await expect(page.getByText(/Hub Oracle/i).first()).toBeVisible();
  await expect(page.getByText(/Static preprod snapshot/i)).toBeVisible();
  await expect(page.getByText(/Preprod snapshot/i).first()).toBeVisible();
  await expect(page.getByText(/entries at the State Queue address/i)).toBeVisible();
  const contractsText = await page.locator("body").innerText();
  expect(contractsText).not.toContain("· Active");
  expect(contractsText).not.toContain("live entries");
  expect(contractsText).not.toContain("holds live protocol state");
  await page.screenshot({ path: testInfo.outputPath("contracts.png") });
});

test("how it works lifecycle language renders cleanly", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:motion", "off");
  });

  await page.goto("/how-it-works");

  await expect(page.getByRole("heading", { name: /Flow of a transaction/i })).toBeVisible();
  await expect(page.locator(".hiw-act__beats").getByText("Data availability check")).toBeVisible();
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
  await expect(page.getByText(/Vulnerability or impersonation/i)).toBeVisible();
  await expect(page.getByText(/Protocol role interest/i)).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: testInfo.outputPath("security.png") });

  await page.goto("/faq");
  await expect(page.getByRole("heading", { name: /Questions, answered plainly/i })).toBeVisible();
  await expect(page.getByText(/Compare the trust model/i)).toBeVisible();
  const comparisonChart = page.locator(".comparison-chart");
  await expect(comparisonChart).toBeVisible();
  await expect(comparisonChart).toContainText("EVM rollups");
  await expect(comparisonChart).toContainText("Sidechains / appchains");
  await expect(page.getByText(/Fault proofs plus Watcher replay/i)).toBeVisible();
  await expect(page.getByText(/Often depends on a bridge/i)).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: testInfo.outputPath("faq.png") });
});
