import { test, expect } from "@playwright/test";

test("login page loads with Yahoo login button", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /login with yahoo/i })).toBeVisible();
});

test("home page loads and shows empty state", async ({ page }) => {
  // set a fake userId so the API call is made (returns empty array → empty state)
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("userId", "test-user"));
  await page.reload();
  await expect(page.getByText(/no teams found/i)).toBeVisible({ timeout: 10_000 });
});

test("navigating to home from login page works", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: /my teams/i }).click();
  await expect(page).toHaveURL("/");
});
