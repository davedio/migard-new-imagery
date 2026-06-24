import { expect, test, type Page } from "@playwright/test";

async function expectNoBrokenImages(page: Page) {
  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
  );

  expect(brokenImages).toEqual([]);
}

test("shared site imagery loads on primary routes", async ({ page }) => {
  const failedImages: string[] = [];
  page.on("requestfailed", (request) => {
    if (request.resourceType() === "image") {
      const failure = request.failure();
      if (failure?.errorText.includes("net::ERR_ABORTED")) return;
      failedImages.push(request.url());
    }
  });
  page.on("response", (response) => {
    if (response.request().resourceType() === "image" && response.status() >= 400) {
      failedImages.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const route of ["/", "/home", "/minimal", "/learn", "/security", "/contracts", "/developers", "/how-it-works", "/faq"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expectNoBrokenImages(page);
  }

  expect(failedImages).toEqual([]);
});

test("home hero and path cards render cleanly", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.locator(".splash--overlay")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /enter/i })).toHaveCount(0);

  await expect(
    page.getByRole("heading", {
      name: /The execution layer for UTXO finance/i,
    }),
  ).toBeVisible();
  await expect(page.locator(".minimal-hero__copy").getByText(/faster execution/i)).toBeVisible();
  await expect(page.locator(".minimal-hero__copy").getByText(/The trust path is public/i)).toBeVisible();
  await expect(page.locator(".minimal-tree")).toBeVisible();
  await expect(page.locator(".minimal-tree__packet")).toHaveCount(2);
  await expect(page.locator(".v2-stage canvas")).toHaveCount(0);
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
  await expect(page.getByRole("link", { name: /^Choose your path$/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /^Choose your path$/i }).first()).toHaveAttribute("href", "#paths");
  const heroRoutes = page.locator(".minimal-hero-routes");
  await expect(page.locator(".minimal-route-strip")).toHaveCount(0);
  await expect(page.locator(".minimal-route-card")).toHaveCount(0);
  await expect(heroRoutes).toBeVisible();
  await expect(heroRoutes.locator(".minimal-hero-route")).toHaveCount(4);
  await expect(heroRoutes.getByRole("link", { name: /Use User path/i })).toHaveAttribute("href", "/learn#roles");
  await expect(heroRoutes.getByRole("link", { name: /Build Developer path/i })).toHaveAttribute("href", "/developers");
  await expect(heroRoutes.getByRole("link", { name: /Verify Security model/i })).toHaveAttribute("href", "/security");
  await expect(heroRoutes.getByRole("link", { name: /Report Security policy/i })).toHaveAttribute("href", "/security#disclosure");
  await page.screenshot({ path: testInfo.outputPath("hero.png") });

  const pathSection = page.locator("#paths");
  await expect(pathSection.getByRole("heading", { name: /Pick the role that matches what you need/i })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Protocol Roles", exact: true })).toBeVisible();
  await expect(pathSection.getByText(/Run Operator or Watcher nodes/i)).toBeVisible();
  await expect(pathSection.getByRole("link", { name: /Learn user path/i })).toHaveAttribute("href", "/learn#roles");
  await expect(pathSection.getByRole("link", { name: /Explore Protocol Roles/i })).toHaveAttribute("href", "/developers#developer-paths");
  await expect(page.getByRole("heading", { name: /Fast execution first/i })).toBeVisible();
  await expect(page.locator(".minimal-flow-row")).toHaveCount(6);
  await expect(page.locator(".minimal-flow-row").first()).toContainText("Submit");
  await expect(page.locator(".minimal-flow-row").nth(3)).toContainText("Data availability");
  await expect(page.locator(".minimal-flow-row").nth(5)).toContainText("Settle");

  await expect(page.locator(".minimal-metric")).toHaveCount(6);
  await expect(page.locator(".minimal-metric").filter({ hasText: "Soft confirmations" })).toBeVisible();
  await expect(page.locator(".minimal-metric").filter({ hasText: "Watcher coverage" })).toBeVisible();
  await expect(page.locator(".v2-footer-statement")).toContainText("Next page");
  await expect(page.locator(".v2-footer-statement")).toContainText("Learn Midgard");
  await expect(page.locator(".v2-footer-statement")).toHaveAttribute("href", "/learn");

  await page.screenshot({ path: testInfo.outputPath("paths.png") });
});

test("cinematic home remains available as a preview", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:motion", "on");
  });

  await page.goto("/home");

  await expect(
    page.getByRole("heading", {
      name: /The execution layer for UTXO finance/i,
    }),
  ).toBeVisible();
  await expect(page.locator(".v2-stage canvas").first()).toBeVisible();
  await expect(page.locator(".minimal-tree")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("cinematic-home.png") });
});

test("desktop nav opens persistent child page menu", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop dropdown behavior only");

  await page.goto("/");

  const learn = page.getByRole("button", { name: /Learn/i });
  const dropdown = page.locator(".site-nav__group", { has: learn }).locator(".site-nav__dropdown");
  await expect(dropdown).toHaveAttribute("aria-hidden", "true");
  await expect(dropdown.getByRole("link", { name: /Learn overview/i })).toHaveCount(0);

  await learn.click();

  await expect(dropdown).toHaveAttribute("aria-hidden", "false");
  await expect(dropdown.getByRole("link", { name: /Learn overview/i })).toBeVisible();
  await expect(dropdown.getByRole("link", { name: /How it works/i })).toBeVisible();
  await expect(dropdown.getByRole("link", { name: /FAQ/i })).toBeVisible();
  await expect(learn).toHaveAttribute("aria-expanded", "true");

  await dropdown.getByRole("link", { name: /FAQ/i }).hover();
  await page.mouse.wheel(0, 420);
  await expect(dropdown.getByRole("link", { name: /FAQ/i })).toBeVisible();

  await page.mouse.move(80, 820);
  await expect(dropdown.getByRole("link", { name: /How it works/i })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("nav-learn-open.png") });
});

test("mobile menu exposes the full routing list clearly", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile menu behavior only");

  await page.goto("/");
  const mobileMenu = page.locator(".site-nav__mobile");
  await expect(mobileMenu).toHaveAttribute("aria-hidden", "true");
  await expect(mobileMenu.getByRole("link", { name: /Developer overview/i })).toHaveCount(0);

  await page.getByRole("button", { name: /open menu/i }).click();

  await expect(mobileMenu).toHaveAttribute("data-open", "true");
  await expect(mobileMenu).toHaveAttribute("aria-hidden", "false");
  await expect(mobileMenu.getByRole("link", { name: /^Home$/i })).toHaveAttribute("href", "/");
  await expect(mobileMenu.getByRole("link", { name: /Learn overview/i })).toHaveAttribute("href", "/learn");
  await expect(mobileMenu.getByRole("link", { name: /How it works/i })).toHaveAttribute("href", "/how-it-works");
  await expect(mobileMenu.getByRole("link", { name: /Developer overview/i })).toHaveAttribute("href", "/developers");
  await expect(mobileMenu.getByRole("link", { name: /^Contracts/i })).toHaveAttribute("href", "/contracts");
  await expect(mobileMenu.getByRole("link", { name: /Security overview/i })).toHaveAttribute("href", "/security");
  await expect(mobileMenu.getByRole("link", { name: /Security policy/i })).toHaveAttribute("href", "/security#disclosure");
  await expect(mobileMenu.getByRole("link", { name: /Open GitHub/i })).toHaveAttribute("href", /github\.com\/Anastasia-Labs\/midgard/);
  await expect(mobileMenu.getByRole("link", { name: /Follow on X/i })).toHaveAttribute("href", /x\.com\/midgardprotocol/);
  await expect(mobileMenu.getByRole("link", { name: /Join Discord/i })).toHaveAttribute("href", /discord\.gg/);
  await expect(mobileMenu.getByRole("link", { name: /Intake form/i })).toHaveAttribute("href", /docs\.google\.com\/forms/);
  await expect(mobileMenu).toContainText("Builder and Protocol Role interest");
  await expect(mobileMenu).not.toContainText("Connect");

  const box = await mobileMenu.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width).toBeGreaterThan(330);
  expect(box?.height).toBeLessThanOrEqual(825);
  await page.screenshot({ path: testInfo.outputPath("mobile-menu.png"), fullPage: true });

  await page.getByRole("button", { name: /close menu/i }).click();
  await expect(mobileMenu).toHaveAttribute("aria-hidden", "true");
});

test("minimal preview renders tree-themed routing concept", async ({ page }, testInfo) => {
  await page.goto("/minimal");

  await expect(
    page.getByRole("heading", {
      name: /The execution layer for UTXO finance/i,
    }),
  ).toBeVisible();
  await expect(page.locator(".minimal-hero__copy").getByText(/settles verified state through Cardano L1/i)).toBeVisible();
  await expect(page.locator(".minimal-tree")).toBeVisible();
  await expect(page.locator(".minimal-tree__packet")).toHaveCount(2);
  await expect(page.locator(".minimal-tree__proof-loop")).toHaveCount(1);
  const routeCards = page.locator(".minimal-hero-route");
  await expect(routeCards).toHaveCount(4);
  await expect(routeCards.nth(0)).toContainText("Use");
  await expect(routeCards.nth(0)).toHaveAttribute("href", "/learn#roles");
  await expect(routeCards.nth(1)).toContainText("Build");
  await expect(routeCards.nth(1)).toHaveAttribute("href", "/developers");
  await expect(routeCards.nth(2)).toContainText("Verify");
  await expect(routeCards.nth(2)).toHaveAttribute("href", "/security");
  await expect(routeCards.nth(3)).toContainText("Report");
  await expect(routeCards.nth(3)).toHaveAttribute("href", "/security#disclosure");
  await expect(page.locator(".minimal-flow-board").getByText("User sees")).toBeVisible();
  await expect(page.locator(".minimal-user-path").getByText("Deposit")).toBeVisible();
  await expect(page.locator(".minimal-flow-row").filter({ hasText: "Data availability" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Apps feel faster/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /State stays checkable/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Cardano L1 settlement comes last/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Ecosystem Partners/i })).toBeVisible();
  await expect(page.getByLabel("Ecosystem partner logos").getByAltText("Liqwid")).toBeVisible();

  const pathSection = page.locator("#paths");
  await expect(pathSection.getByRole("heading", { name: /Pick the role that matches what you need/i })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("heading", { name: "Protocol Roles", exact: true })).toBeVisible();
  await expect(pathSection.getByRole("link", { name: /Learn user path/i })).toHaveAttribute("href", "/learn#roles");
  await expect(pathSection.getByRole("link", { name: /Explore Protocol Roles/i })).toHaveAttribute("href", "/developers#developer-paths");

  await expect(page.locator(".minimal-metric")).toHaveCount(6);
  await expect(page.locator(".minimal-metric").filter({ hasText: "Soft confirmations" })).toContainText("Benchmark");
  await expect(page.locator(".minimal-metric").filter({ hasText: "Verified contracts" })).toContainText("Formal review");
  await expect(page.getByRole("heading", { name: /Inspect before you trust speed/i })).toBeVisible();
  await expect(page.locator(".minimal-proof-rail")).toContainText("Verified trust path");
  const inspectGrid = page.locator(".minimal-inspect-grid");
  await expect(inspectGrid.getByRole("link", { name: /Security model/i })).toHaveAttribute("href", "/security");
  await expect(inspectGrid.getByRole("link", { name: /Contract surface/i })).toHaveAttribute("href", "/contracts");
  await expect(inspectGrid.getByRole("link", { name: /Source review/i })).toHaveAttribute("href", /github\.com\/Anastasia-Labs\/midgard/);
  await expect(page.locator(".minimal-channel-card")).toHaveCount(4);
  if (testInfo.project.name === "desktop-chromium") {
    await expect(page.locator(".minimal-channel-grid")).toHaveCSS("grid-template-columns", /px .*px/);
  }
  await expect(page.locator(".minimal-channel-card").first()).toContainText("Report something sensitive");
  await expect(page.locator(".minimal-channel-card").filter({ hasText: "Security policy" })).toHaveAttribute("href", "/security#disclosure");
  await expect(page.locator(".minimal-channel-card").filter({ hasText: "Intake form" })).toContainText("Protocol Roles");
  await expect(page.locator(".minimal-channel-socials").getByRole("link", { name: /Open GitHub/i })).toHaveAttribute("href", /github\.com\/Anastasia-Labs\/midgard/);
  await expect(page.locator(".minimal-channel-socials").getByRole("link", { name: /Follow on X/i })).toHaveAttribute("href", /x\.com\/midgardprotocol/);
  await expect(page.locator(".minimal-channel-socials").getByRole("link", { name: /Join Discord/i })).toHaveAttribute("href", /discord\.gg/);
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
  await expect(devDropdown.getByRole("link", { name: /Intake form/i })).toBeVisible();

  const security = page.getByRole("button", { name: /^Security$/i });
  await security.click();
  const securityDropdown = page.locator(".site-nav__group", { has: security }).locator(".site-nav__dropdown");
  await expect(securityDropdown.getByRole("link", { name: /Security overview/i })).toBeVisible();
  await expect(securityDropdown.getByRole("link", { name: /Security policy/i })).toBeVisible();

  await expect(page.getByRole("button", { name: /^Connect$/i })).toHaveCount(0);
  const nav = page.locator(".site-nav");
  await expect(nav.getByRole("link", { name: /Open GitHub/i })).toHaveAttribute("href", /github\.com\/Anastasia-Labs\/midgard/);
  await expect(nav.getByRole("link", { name: /Follow on X/i })).toHaveAttribute("href", /x\.com\/midgardprotocol/);
  await expect(nav.getByRole("link", { name: /Join Discord/i })).toHaveAttribute("href", /discord\.gg/);

  await page.screenshot({ path: testInfo.outputPath("nav-developers-security-open.png") });
});

test("learn overview page renders the agreed language map", async ({ page }, testInfo) => {
  await page.goto("/learn");

  await expect(page.getByRole("heading", { name: /Learn Midgard/i })).toBeVisible();
  await expect(page.getByText(/plain-language map of faster UTXO execution/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /One path, three jobs/i })).toBeVisible();
  await expect(page.getByLabel("Midgard core model").getByText(/Deposit, transact, withdraw/i)).toBeVisible();
  await expect(page.getByLabel("Midgard core model").getByText(/Final Cardano L1 settlement after verification/i)).toBeVisible();
  await expect(page.getByText(/The user path stays simple while the protocol handles verification underneath/i)).toBeVisible();
  await expect(page.getByText(/Submit, sequence, commit, data availability, watch, settle/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Builders", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Protocol Roles", exact: true })).toBeVisible();
  await expect(page.getByText(/Protocol Roles participate in the Midgard network/i)).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("fault-proof");
  expect(bodyText).not.toContain("fraud-proof");
  expect(bodyText).not.toContain("Bitcoin DeFi");

  await page.screenshot({ path: testInfo.outputPath("learn.png") });
});

test("developer and contracts pages render", async ({ page }, testInfo) => {
  await page.goto("/developers");
  await expect(page.getByRole("heading", { name: /Build on the execution layer for UTXO finance/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Open the source, then follow the path/i })).toBeVisible();
  await expect(page.getByLabel("Developer integration path").getByText(/One app flow at a time/i)).toBeVisible();
  await expect(page.getByLabel("Developer integration path").getByRole("heading", { name: /App flow/i })).toBeVisible();
  await expect(page.getByText(/Supporting docs/i)).toBeVisible();
  await expect(page.getByLabel("Supporting documents").getByRole("link", { name: /Whitepaper/i })).toHaveAttribute("href", /midgard\.pdf/);
  await expect(page.locator("main").getByRole("heading", { name: /Protocol reviewers/i })).toBeVisible();
  await expect(page.locator("main").getByRole("heading", { name: /Midgard Stack/i })).toBeVisible();
  await expect(page.locator("[aria-labelledby='developer-launchpad-title']").getByRole("link", { name: /Review source/i })).toHaveAttribute("href", /github\.com\/Anastasia-Labs\/midgard/);
  await expect(page.locator("[aria-labelledby='developer-launchpad-title']").getByRole("link", { name: /Contract addresses/i })).toHaveAttribute("href", "/contracts");
  await expect(page.locator("[aria-labelledby='developer-launchpad-title']").getByRole("link", { name: /Security model/i })).toHaveAttribute("href", "/security");
  await expect(page.locator("[aria-labelledby='developer-launchpad-title']").getByRole("link", { name: /Protocol Roles/i })).toHaveAttribute("href", /docs\.google\.com\/forms/);
  await expect(page.getByRole("heading", { name: /Application builders/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Inspect contracts/i }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("developers.png") });

  await page.goto("/contracts");
  await expect(page.getByRole("heading", { name: /Inspect the contract path/i })).toBeVisible();
  await expect(page.locator("h1")).toHaveText("Inspect the contract path.");
  await expect(page.locator("[data-contracts-hero]")).toBeVisible();
  await expect(page.locator(".contracts-page .page-hero")).toHaveCount(0);
  await expect(page.locator("[data-contracts-hero]").getByText(/Validator topology/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /The protocol surface/i })).toBeVisible();
  await expect(page.getByText(/Hub Oracle/i).first()).toBeVisible();
  await expect(page.getByText(/Snapshot, not live status/i)).toBeVisible();
  await expect(page.getByText(/Preprod snapshot/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /User bridge/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Commitment path/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Challenge path/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Evidence/i })).toBeVisible();
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
  await expect(page.locator(".hiw-act__beats")).toContainText("Data availability check");
  await expect(page.locator(".hiw-act__lead").getByText(/deposit, transact, withdraw/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Fast execution first/i })).toBeVisible();
  await expect(page.locator(".hiw-explainer__card")).toHaveCount(6);
  await expect(page.locator(".hiw-explainer__card").first()).toContainText("faster usable signal");
  await expect(page.locator(".hiw-explainer__card").nth(4)).toContainText("Operators do not get the final word");
  await expect(page.locator(".hiw-explainer__card").nth(5)).toContainText("inherits Cardano L1 security");

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).toContain("Cardano L1 settlement");
  expect(bodyText).toContain("fault-proof");
  expect(bodyText).not.toContain("fraud-proof");
  expect(bodyText).not.toContain("fraud proof");

  await page.screenshot({ path: testInfo.outputPath("how-it-works.png") });
});

test("security and faq pages render", async ({ page }, testInfo) => {
  await page.goto("/security");
  await expect(page.getByRole("heading", { name: /Security assumptions you can inspect/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Inspect the trust path from multiple angles/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Inspect contracts/i })).toHaveAttribute("href", "/contracts");
  await expect(page.getByRole("link", { name: /Report safely/i })).toHaveAttribute("href", "/security#disclosure");
  await expect(page.getByRole("heading", { name: /Fast confirmations first/i })).toBeVisible();
  await expect(page.getByText(/Lower attack surface, not magic/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Soft confirmation/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cardano L1 settlement", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /What the claim means/i })).toBeVisible();
  await expect(page.getByText(/Soft confirmations are not final settlement/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Mathematically verified contracts/i })).toBeVisible();
  await expect(page.getByText(/fault-proof verification/i).first()).toBeVisible();
  const securityMain = page.locator("main");
  await expect(securityMain.getByRole("heading", { name: /Vulnerability or impersonation/i })).toBeVisible();
  await expect(securityMain.getByRole("heading", { name: /Protocol Role interest/i })).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: testInfo.outputPath("security.png") });

  await page.goto("/faq");
  await expect(page.getByRole("heading", { name: /Questions, answered plainly/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start with basics/i })).toHaveAttribute("href", "#basics");
  await expect(page.getByRole("heading", { name: /Start with the basics/i })).toBeVisible();
  await expect(page.getByLabel("FAQ topic shortcuts").getByText(/Jump to topic/i)).toBeVisible();
  await expect(page.getByLabel("FAQ topic shortcuts").getByRole("link", { name: /Security/i })).toHaveAttribute("href", "#faq-security");
  await expect(page.getByLabel("FAQ topic shortcuts").getByRole("link", { name: /Protocol Roles/i })).toHaveAttribute("href", "#faq-protocol-roles-and-status");
  await expect(page.getByRole("heading", { name: /Compare the trust model/i })).toBeVisible();
  const faqOrder = await page.locator("main").evaluate((main) => ({
    basics: main.querySelector("#basics")?.getBoundingClientRect().top ?? 0,
    comparison: main.querySelector("#comparison")?.getBoundingClientRect().top ?? 0,
  }));
  expect(faqOrder.basics).toBeLessThan(faqOrder.comparison);
  await expect(page.locator(".faq-decision-card")).toHaveCount(3);
  await expect(page.locator(".faq-decision-card").filter({ hasText: "Midgard" })).toContainText("UTXO apps that need faster execution");
  await expect(page.locator(".faq-decision-card").filter({ hasText: "EVM rollups" })).toContainText("Bridge design");
  await expect(page.locator(".faq-decision-card").filter({ hasText: "Sidechains / appchains" })).toContainText("Validator set");
  const comparisonChart = page.locator(".comparison-chart");
  await expect(comparisonChart).toBeVisible();
  await expect(page.locator(".faq-model-card__score")).toHaveCount(9);
  await expect(comparisonChart).toContainText("EVM rollups");
  await expect(comparisonChart).toContainText("Sidechains / appchains");
  await expect(comparisonChart).toContainText("Data availability");
  await expect(comparisonChart).toContainText("Rule-change risk");
  await expect(page.locator(".comparison-chart__legend")).toContainText("Strong fit");
  await expect(page.locator(".comparison-chart__legend")).toContainText("Higher caution");
  await expect(comparisonChart).toContainText("Inspect details");
  await expect(page.getByText(/Fault proofs plus Watcher replay/i)).toBeVisible();
  await expect(page.getByText(/Often depends on a bridge/i)).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: testInfo.outputPath("faq.png") });
});
