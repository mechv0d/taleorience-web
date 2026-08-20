import { expect, test, type Page } from "@playwright/test";

async function openProject(page: Page) {
  await page.goto("/");
  await page.getByTestId("project-card").filter({ hasText: "Questing in Selenia" }).click();
  await expect(page.getByTestId("left-sidebar")).toBeVisible();
}

test("Ctrl+K opens the project search palette", async ({ page }) => {
  await openProject(page);

  await page.keyboard.press("Control+K");
  await expect(page.getByRole("dialog", { name: "Search project" })).toBeVisible();

  await page.getByLabel("Search query").fill("citadel");
  // The seeded data has no text blocks, so the search yields no matches.
  await expect(page.getByText(/No matches for/)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Search project" })).not.toBeVisible();
});

test("the top bar search button opens the palette", async ({ page }) => {
  await openProject(page);

  await page.getByRole("button", { name: /Search Questing/ }).click();
  await expect(page.getByRole("dialog", { name: "Search project" })).toBeVisible();
});