import { expect, test, type Page } from "@playwright/test";

const PROJECT_NAME = "Questing in Selenia";
const ROOT_NAME = "Questing in Selenia";
const CHILD_NAME = "Moonlight Citadel";

async function openProject(page: Page) {
  await page.goto("/");
  await page.getByTestId("project-card").filter({ hasText: PROJECT_NAME }).click();
  await expect(page.getByTestId("left-sidebar")).toBeVisible();
}

test("tree shows the project hierarchy", async ({ page }) => {
  await openProject(page);

  await expect(page.getByTestId("tree-node")).toHaveCount(2);
  await expect(page.getByTestId("tree-node").first()).toContainText(ROOT_NAME);
  await expect(page.getByRole("treeitem", { name: CHILD_NAME })).toBeVisible();
});

test("navigating to an object shows breadcrumbs, title and pages", async ({ page }) => {
  await openProject(page);

  // Root object: Home badge + Main page tab.
  await expect(page.getByRole("heading", { level: 1, name: ROOT_NAME })).toBeVisible();
  await expect(page.getByRole("button", { name: /Main/ })).toBeVisible();

  // Open the child object from the tree.
  await page.getByRole("treeitem", { name: CHILD_NAME }).click();
  await expect(page.getByRole("heading", { level: 1, name: CHILD_NAME })).toBeVisible();

  // Breadcrumb shows the parent path.
  await expect(page.getByLabel("Breadcrumb")).toContainText(ROOT_NAME);
  await expect(page.getByLabel("Breadcrumb")).toContainText(CHILD_NAME);

  // Page content area renders (empty page state in the seeded data).
  await expect(page.getByText("This page is empty.")).toBeVisible();
});

test("the right sidebar shows tags and relations sections", async ({ page }) => {
  await openProject(page);
  await page.getByRole("treeitem", { name: CHILD_NAME }).click();

  await expect(page.getByTestId("right-sidebar")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tags" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Relations" })).toBeVisible();
});