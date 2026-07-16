import { expect, test, type Page } from "@playwright/test";

async function expectNoBrokenImages(page: Page) {
  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => !img.complete || img.naturalWidth === 0)
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
  await expect(page.getByRole("link", { name: /See how it works/i })).toHaveAttribute(
    "href",
    "/learn",
  );
  await expect(page.getByRole("link", { name: "Start building", exact: true })).toHaveAttribute(
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
  await expect(links).toHaveText(["Home", "Learn", "Users", "Developers", "Participate"]);
  await expect(page.locator('.site-nav__links a[href="/learn"]')).toHaveAttribute("data-active", "false");
  // no dropdown machinery remains
  await expect(page.locator(".site-nav__group, .site-nav__dropdown")).toHaveCount(0);

  // Learn stays lit on its family pages (/faq, /glossary)
  await page.goto("/faq");
  await expect(page.locator('.site-nav__links a[href="/learn"]')).toHaveAttribute("data-active", "true");

  await page.screenshot({ path: testInfo.outputPath("nav-flat.png") });
});

test("/economics permanently redirects into the Learn economics table", async ({ page }) => {
  await page.goto("/economics");
  await expect(page).toHaveURL(/\/learn#economics$/);
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
  await expect(page.getByRole("heading", { name: /Proof metrics/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Start with the path/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Security, in plain language/i })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("learn.png"), fullPage: true });

  await page.goto("/users");
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole("heading", { name: /Fast interactions/i })).toBeVisible();
  await expect(page.locator(".hiw-act")).toHaveCount(0);
  await expect(page.locator(".datarows__body").filter({ hasText: "Fees in ADA" })).toBeVisible();
  await expect(page.getByText("Deposit. Transact. Withdraw.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("users.png"), fullPage: true });

  await page.goto("/faq");
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.getByRole("heading", { name: "Questions." }).first()).toBeVisible();
  await expect(page.locator(".hiw-act")).toHaveCount(0);
  await expect(page.getByLabel("FAQ topic shortcuts")).toHaveCount(0);
  await expect(page.locator(".faq-decision-card")).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath("faq.png"), fullPage: true });

  await page.goto("/glossary");
  await expect(page).toHaveURL(/\/glossary$/);
  await expect(page.getByRole("heading", { name: "Glossary." })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "UTXO" })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "fault proof" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("glossary.png"), fullPage: true });
});

test("legacy and child routes land on current pages", async ({ page }) => {
  await page.goto("/faqs");
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.getByRole("heading", { name: "Questions." }).first()).toBeVisible();

  await page.goto("/how-it-works");
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { name: /Midgard Overview/i })).toBeVisible();

  await page.goto("/contracts");
  await expect(page).toHaveURL(/\/developers#contracts$/);
  await expect(page.getByRole("heading", { name: /Build fast apps with Cardano-rooted settlement/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Core validators/i })).toBeVisible();
});

test("Learn and Participate no longer end in blank hidden content", async ({ page }, testInfo) => {
  await page.goto("/learn");
  await expect(page.getByRole("heading", { name: /Now follow one transaction/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Proof metrics/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Security, in plain language/i })).toBeVisible();
  await expect(page.locator(".hiw-act")).toHaveCount(1);
  await expect(page.locator('.datarows__row[href="/faq"]')).toContainText("FAQ");
  await expect(page.locator('.datarows__row[href="/glossary"]')).toContainText("Glossary");
  await page.screenshot({ path: testInfo.outputPath("learn-hub.png"), fullPage: true });

  await page.goto("/participate");
  await expect(page.getByRole("heading", { name: /Run the protocol/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Operators and Watchers/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Economics/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Use the official path/i })).toBeVisible();
  await expect(page.locator(".cta-band")).toContainText("Register interest");
  await page.screenshot({ path: testInfo.outputPath("participate.png"), fullPage: true });
});
