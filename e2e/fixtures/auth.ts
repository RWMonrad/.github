import { test as base, expect, type Page } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, "../.auth/user.json");

/**
 * Authenticate via Supabase email/password and persist the session
 * so subsequent tests skip the login flow.
 */
export async function authenticateUser(page: Page) {
  const email = process.env.TEST_USER_EMAIL!;
  const password = process.env.TEST_USER_PASSWORD!;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.test"
    );
  }

  await page.goto("/login");

  // Fill login form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({
    timeout: 10_000,
  });

  // Save signed-in state
  await page.context().storageState({ path: AUTH_FILE });
}

/**
 * Extended test fixture that provides a logged-in page.
 */
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
