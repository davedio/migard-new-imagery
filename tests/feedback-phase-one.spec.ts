import { expect, test, type Page } from "@playwright/test";

async function expectFluidTokensFits(page: Page) {
  const fluidCard = page.locator('.partner-magnet-card[data-partner="FluidTokens"]');
  await expect(fluidCard).toBeVisible();
  const fluidFit = await fluidCard.evaluate((card) => {
    const label = card.querySelector<HTMLElement>(".partner-magnet-card__name");
    if (!label) return null;
    const cardRect = card.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const paddingRight = Number.parseFloat(getComputedStyle(card).paddingRight) || 0;
    return {
      cardRight: cardRect.right - paddingRight,
      labelRight: labelRect.right,
    };
  });
  expect(fluidFit).not.toBeNull();
  expect(fluidFit!.labelRight).toBeLessThanOrEqual(fluidFit!.cardRight + 1);
}

test.describe("colleague-feedback phase one", () => {
  test("benchmark qualification is centralized once per affected page", async ({ page }) => {
    for (const route of ["/", "/learn", "/developers", "/users", "/participate"]) {
      await page.goto(route);
      await expect(page.getByText(/^Benchmark status:/)).toHaveCount(1);
      await expect(page.locator("body")).not.toContainText(/\bestimated\b|\bunbenchmarked\b/i);
    }

    await page.goto("/status");
    await expect(page.getByText(/^Benchmark status:/)).toHaveCount(1);
    await expect(page.locator("#legend")).toContainText(
      "Performance figures labeled Target are current design goals",
    );
    await expect(page.locator("body")).not.toContainText(/\bestimated\b|\bunbenchmarked\b/i);

    await page.goto("/learn");
    await expect(page.locator("body")).toContainText("Up to 300x");
    await page.goto("/");
    await expect(page.locator("body")).toContainText("10 to 30x");
    await expect(page.locator("body")).toContainText("30–50%");
  });

  test("fragment headings lose periods while full-sentence headings retain them", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: "Midgard Overview", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Summary view", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Glossary", exact: true })).toBeVisible();

    await page.goto("/status");
    await expect(
      page.getByRole("heading", { name: "Current network status", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Performance", exact: true })).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "How Midgard compares", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Choose your path.", exact: true })).toBeVisible();

    await page.goto("/developers");
    await expect(
      page.getByRole("heading", { name: "Choose your developer path.", exact: true }),
    ).toBeVisible();
  });

  test("footer, FluidTokens, and Users board retain responsive separation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    await expectFluidTokensFits(page);

    const footerPadding = await page.locator(".site-footer").evaluate((footer) =>
      Number.parseFloat(getComputedStyle(footer).paddingTop),
    );
    expect(footerPadding).toBeGreaterThanOrEqual(56);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 768, height: 720 });
    await page.goto("/");
    await expectFluidTokensFits(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(1);

    await page.goto("/users");
    const applicationGap = await page.locator("#applications").evaluate((section) => {
      const heading = section.querySelector("h2");
      const board = section.querySelector<HTMLElement>('[role="img"]');
      if (!heading || !board) return null;
      return board.getBoundingClientRect().top - heading.getBoundingClientRect().bottom;
    });
    expect(applicationGap).not.toBeNull();
    expect(applicationGap!).toBeGreaterThanOrEqual(23);

    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    const mobileFooterPadding = await page.locator(".site-footer").evaluate((footer) =>
      Number.parseFloat(getComputedStyle(footer).paddingTop),
    );
    expect(mobileFooterPadding).toBeGreaterThanOrEqual(48);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(1);
  });
});
