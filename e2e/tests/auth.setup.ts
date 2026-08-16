import { test as setup } from "@playwright/test";
import { authenticateUser } from "../fixtures/auth";

setup("authenticate", async ({ page }) => {
  await authenticateUser(page);
});
