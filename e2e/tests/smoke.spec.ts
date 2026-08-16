import { test, expect } from "../fixtures/auth";

test.describe("Smoke tests", () => {
  test("app loads and shows dashboard", async ({ authedPage: page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/custonic/i);
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test("navigation sidebar renders all sections", async ({
    authedPage: page,
  }) => {
    await page.goto("/dashboard");

    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Core nav items
    const expectedLinks = [
      /dashboard/i,
      /contracts/i,
      /analyses|analysis/i,
      /settings/i,
    ];

    for (const linkPattern of expectedLinks) {
      await expect(
        nav.getByRole("link", { name: linkPattern })
      ).toBeVisible();
    }
  });

  test("unauthenticated user is redirected to login", async ({ browser }) => {
    // Fresh context without stored auth
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();

    await context.close();
  });
});
