import { expect, test, type Page } from "@playwright/test";

const seededCard = (page: Page) =>
  page.getByTestId("project-card").filter({ hasText: "Questing in Selenia" });

test("project list renders the seeded project", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(seededCard(page)).toHaveCount(1);
  await expect(seededCard(page)).toContainText("Questing in Selenia");
});

test("opening a project lands on the workspace", async ({ page }) => {
  await page.goto("/");

  await seededCard(page).click();
  await expect(page.getByTestId("left-sidebar")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Questing in Selenia" })).toBeVisible();
});

test("creating a project shows it in the list, then deleting removes it", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Project name").fill("E2E Temp World");
  await page.getByRole("button", { name: "Create", exact: true }).click();

  // Creating a project navigates to the workspace — go back to the list.
  await page.goto("/");

  const card = page.getByTestId("project-card").filter({ hasText: "E2E Temp World" });
  await expect(card).toBeVisible();

  await card.hover();
  await card.getByRole("button", { name: "Delete E2E Temp World" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(card).not.toBeVisible();
});