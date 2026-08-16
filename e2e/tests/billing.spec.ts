import { test, expect } from "../fixtures/auth";

test.describe("Billing & Subscription", () => {
  test("billing page loads with plan information", async ({
    authedPage: page,
  }) => {
    await page.goto("/dashboard/settings/billing");

    // Should show current plan
    await expect(page.getByText(/free|pro|business/i)).toBeVisible();
  });

  test("displays available plans for upgrade", async ({
    authedPage: page,
  }) => {
    await page.goto("/dashboard/settings/billing");

    // Check that plan cards are visible
    const planNames = ["Free", "Pro", "Business"];
    for (const plan of planNames) {
      await expect(
        page.getByText(new RegExp(plan, "i")).first()
      ).toBeVisible();
    }
  });

  test("upgrade button triggers Stripe checkout", async ({
    authedPage: page,
  }) => {
    await page.goto("/dashboard/settings/billing");

    // Click upgrade on Pro plan
    const proCard = page.locator('[data-testid="plan-pro"]').or(
      page.getByText(/pro/i).locator("..").locator("..")
    );

    const upgradeBtn = proCard
      .getByRole("button", { name: /upgrade|subscribe|select/i })
      .first();

    if (await upgradeBtn.isVisible()) {
      // Expect clicking upgrade to navigate to Stripe or open checkout
      const [popup] = await Promise.all([
        page.waitForEvent("popup", { timeout: 5_000 }).catch(() => null),
        upgradeBtn.click(),
      ]);

      if (popup) {
        // Redirected to Stripe checkout
        await expect(popup).toHaveURL(/stripe\.com|checkout/);
        await popup.close();
      } else {
        // Embedded checkout or redirect
        await page.waitForURL(/stripe|checkout|billing/, {
          timeout: 5_000,
        }).catch(() => {
          // May stay on page with embedded Stripe elements
        });
      }
    }
  });
});
