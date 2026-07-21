import { expect, test, type Page } from "@playwright/test";

async function expectNoBrokenImages(page: Page) {
  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      // Offscreen `loading="lazy"` images may correctly remain unrequested.
      // A completed image with no intrinsic width is the actual broken state.
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
  );

  expect(brokenImages).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test("primary routes render with imagery and without horizontal overflow", async ({ page }) => {
  const failedImages: string[] = [];
  page.on("requestfailed", (request) => {
    if (request.resourceType() !== "image") return;
    const failure = request.failure();
    if (failure?.errorText.includes("net::ERR_ABORTED")) return;
    failedImages.push(request.url());
  });
  page.on("response", (response) => {
    if (response.request().resourceType() === "image" && response.status() >= 400) {
      failedImages.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const route of [
    "/",
    "/learn",
    "/users",
    "/economics",
    "/developers",
    "/participate",
    "/how-it-works",
    "/faq",
    "/glossary",
    "/contracts",
    "/faqs",
  ]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expectNoBrokenImages(page);
    await expectNoHorizontalOverflow(page);
  }

  expect(failedImages).toEqual([]);
});

test("home hero and dark-mode heading hover stay readable", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("midgard:theme", "light");
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /The execution layer for UTXO finance/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Start here: choose your path" })).toHaveCount(0);
  await expect(page.locator(".minimal-hero__copy")).toContainText("Cardano L1");
  await expect(page.locator(".hero-tree-stage")).toBeVisible();
  await expect(page.locator(".minimal-actions").getByRole("link", { name: "Midgard Overview" })).toHaveAttribute(
    "href",
    "/learn",
  );
  await expect(page.locator(".minimal-actions").getByRole("link", { name: "Developers" })).toHaveAttribute(
    "href",
    "/developers",
  );
  await expect(page.getByRole("link", { name: /Participate/i }).first()).toHaveAttribute(
    "href",
    "/participate",
  );
  await expect(page.locator("footer")).not.toContainText("Next page");
  await expect(page.locator("footer")).not.toContainText("Grown on Cardano");
  await expect(page.locator("footer")).toContainText("© 2026 Midgard Labs");

  await page.locator(".site-nav__theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const h1 = page.locator("h1").first();
  const box = await h1.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.43, box!.y + box!.height * 0.52);
  await page.waitForTimeout(350);

  const hoverState = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    h1Color: getComputedStyle(document.querySelector("h1")!).color,
    hiddenChars: Array.from(document.querySelectorAll<HTMLElement>(".shx-ch"))
      .filter((el) => getComputedStyle(el).opacity === "0")
      .map((el) => el.textContent)
      .join(""),
  }));
  expect(hoverState.theme).toBe("dark");
  expect(hoverState.h1Color).toBe("rgb(244, 241, 230)");
  if (testInfo.project.name === "desktop-chromium") {
    expect(hoverState.hiddenChars.length).toBeGreaterThan(0);
  }

  await page.screenshot({ path: testInfo.outputPath("home-h1-dark-hover.png") });
});

test("desktop nav is a flat page row with correct active state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop nav behavior only");

  await page.goto("/");

  const links = page.locator(".site-nav__links a");
  await expect(links).toHaveText(["Home", "Learn", "Developers", "Participate", "Users"]);
  await expect(page.locator('.site-nav__links a[href="/learn"]')).toHaveAttribute("data-active", "false");
  // no dropdown machinery remains
  await expect(page.locator(".site-nav__group, .site-nav__dropdown")).toHaveCount(0);

  // Legacy reference routes resolve into Learn.
  await page.goto("/faq");
  await expect(page).toHaveURL(/\/learn#faq$/);
  await expect(page.locator('.site-nav__links a[href="/learn"]')).toHaveAttribute("data-active", "true");

  await page.screenshot({ path: testInfo.outputPath("nav-flat.png") });
});

test("/economics permanently redirects into the home economics table", async ({ page }) => {
  await page.goto("/economics");
  await expect(page).toHaveURL(/\/#economics$/);
});

test("the official preprod link opens the published contract directory", async ({ page }) => {
  await page.goto("/official-links");
  const contractsLink = page.locator("main").getByRole("link", { name: /Preprod contracts/ });
  await expect(contractsLink).toHaveAttribute("href", "/developers#contracts");
  await contractsLink.click();

  await expect(page).toHaveURL(/\/developers#contracts$/);
  await expect(page.getByRole("heading", { name: "Inspect the contract path." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Core validators" })).toBeVisible();
  await expect(page.getByText("Cardano preprod · Preprod snapshot")).toBeVisible();
});

test("mobile menu lists the flat page links", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile menu behavior only");

  await page.goto("/");
  const mobileMenu = page.locator(".site-nav__mobile");
  await expect(mobileMenu).toHaveAttribute("aria-hidden", "true");

  await page.getByRole("button", { name: /open menu/i }).click();

  await expect(mobileMenu).toHaveAttribute("data-open", "true");
  await expect(mobileMenu.getByRole("link", { name: /^Home$/i })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(mobileMenu.getByRole("link", { name: /^Learn$/i })).toHaveAttribute(
    "href",
    "/learn",
  );
  await expect(mobileMenu.getByRole("link", { name: /^Users$/i })).toHaveAttribute(
    "href",
    "/users",
  );
  await expect(mobileMenu.getByRole("link", { name: /^Developers$/i })).toHaveAttribute(
    "href",
    "/developers",
  );
  await expect(mobileMenu.getByRole("link", { name: /^Participate$/i })).toHaveAttribute(
    "href",
    "/participate",
  );

  await page.screenshot({ path: testInfo.outputPath("mobile-menu.png"), fullPage: true });
});

test("Learn, Users, FAQ, and Glossary pages start on their own content", async ({ page }, testInfo) => {
  await page.goto("/learn");
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { name: /Midgard Overview/i })).toBeVisible();
  await expect(page.locator(".hiw-act")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /The key numbers/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Summary view/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Security, in plain language/i })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("learn.png"), fullPage: true });

  await page.goto("/users");
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole("heading", { name: /Faster execution for Cardano apps/i })).toBeVisible();
  await expect(page.locator(".hiw-act")).toHaveCount(0);
  await expect(
    page.getByRole("list", { name: "User economics" }).getByRole("listitem").filter({
      hasText: "Fees paid in ADA",
    }),
  ).toBeVisible();
  await expect(page.getByText("Deposit. Transact. Withdraw.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("users.png"), fullPage: true });

  await page.goto("/faq");
  await expect(page).toHaveURL(/\/learn#faq$/);
  await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
  await expect(page.locator(".hiw-act")).toHaveCount(1);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "How Midgard compares" })).toBeVisible();
  await expect(page.locator(".faq-decision-card")).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath("home-comparison.png"), fullPage: true });

  await page.goto("/glossary");
  await expect(page).toHaveURL(/\/learn#glossary$/);
  await expect(page.getByRole("heading", { name: "Glossary" })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "UTXO" })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "fault proof" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("glossary.png"), fullPage: true });
});

test("legacy and child routes land on current pages", async ({ page }) => {
  await page.goto("/faqs");
  await expect(page).toHaveURL(/\/learn#faq$/);
  await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();

  await page.goto("/learn#comparison");
  await expect(page).toHaveURL(/\/#comparison$/);
  await expect(page.getByRole("heading", { name: "How Midgard compares" })).toBeVisible();

  await page.goto("/how-it-works");
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { name: /Midgard Overview/i })).toBeVisible();

  await page.goto("/contracts");
  await expect(page).toHaveURL(/\/status$/);
  await expect(page.getByRole("heading", { name: "Current network status" })).toBeVisible();
  await expect(
    page.getByText("Protocol contracts and the genesis snapshot are public on Cardano preprod."),
  ).toBeVisible();
});

test("Learn and Participate no longer end in blank hidden content", async ({ page }, testInfo) => {
  await page.goto("/learn");
  await expect(page.getByRole("heading", { name: /The flow of a transaction/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /The key numbers/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Security, in plain language/i })).toBeVisible();
  await expect(page.locator(".hiw-act")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "FAQs" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Glossary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Glossary" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("learn-hub.png"), fullPage: true });

  await page.goto("/participate");
  await expect(page.getByRole("heading", { name: /Run the protocol/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Operators and Watchers/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Economics/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Security you can verify/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Get in touch/i })).toBeVisible();
  await expect(page.locator(".cta-band")).toContainText("Register interest");
  await page.screenshot({ path: testInfo.outputPath("participate.png"), fullPage: true });
});
