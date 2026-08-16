import { test, expect } from "../fixtures/auth";
import path from "path";

test.describe("Contracts", () => {
  test("contracts list page loads", async ({ authedPage: page }) => {
    await page.goto("/dashboard/contracts");
    await expect(
      page.getByRole("heading", { name: /contracts/i })
    ).toBeVisible();
  });

  test("upload contract flow", async ({ authedPage: page }) => {
    await page.goto("/dashboard/contracts");

    // Click upload / new contract button
    await page.getByRole("button", { name: /upload|new contract|add/i }).click();

    // Expect the upload dialog or page
    await expect(
      page.getByText(/upload|drag.*drop|select.*file/i)
    ).toBeVisible();

    // Upload a test PDF
    const testPdfPath = path.join(__dirname, "../fixtures/sample-contract.pdf");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);

    // Fill required fields
    const titleInput = page.getByLabel(/title|name/i);
    if (await titleInput.isVisible()) {
      await titleInput.fill("E2E Test Contract");
    }

    // Submit
    await page.getByRole("button", { name: /upload|submit|save/i }).click();

    // Verify contract appears in the list
    await expect(page.getByText("E2E Test Contract")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("rejects non-PDF/DOCX uploads", async ({ authedPage: page }) => {
    await page.goto("/dashboard/contracts");
    await page.getByRole("button", { name: /upload|new contract|add/i }).click();

    // Try uploading a .txt file
    const fileInput = page.locator('input[type="file"]');
    const txtPath = path.join(__dirname, "../fixtures/invalid-file.txt");
    await fileInput.setInputFiles(txtPath);

    // Expect an error message about file type
    await expect(
      page.getByText(/pdf|docx|invalid.*type|not.*supported/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});
