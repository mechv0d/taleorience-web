import { expect, test, type Page } from "@playwright/test";

const PROJECT_NAME = "Questing in Selenia";
const WIKI_TARGET = "Tower of Knowledge";
const API = "http://localhost:4000";

interface ChildObject {
  id: string;
  name: string;
}

/**
 * Creates (or reuses) a dedicated child object for the test and empties its
 * "Main" page, so parallel editor tests never share mutable block state.
 */
async function ensureChildObject(page: Page, name: string): Promise<ChildObject> {
  const projects = await (await page.request.get(`${API}/api/v1/projects`)).json();
  const projectId = projects.find((p: { name: string }) => p.name === PROJECT_NAME).id;
  const tree = await (
    await page.request.get(`${API}/api/v1/projects/${projectId}/game-objects/tree`)
  ).json();
  const root = tree[0];
  let object = root.children.find((o: { name: string }) => o.name === name) as ChildObject | undefined;
  if (!object) {
    const created = await page.request.post(`${API}/api/v1/projects/${projectId}/game-objects`, {
      data: { name, parentId: root.id },
    });
    object = await created.json();
  }
  const pages = await (
    await page.request.get(`${API}/api/v1/projects/${projectId}/game-objects/${object.id}/pages`)
  ).json();
  const blocks = await (
    await page.request.get(`${API}/api/v1/projects/${projectId}/pages/${pages[0].id}/blocks`)
  ).json();
  for (const block of blocks) {
    await page.request.delete(`${API}/api/v1/projects/${projectId}/blocks/${block.id}`);
  }
  return object;
}

async function openEditor(page: Page, objectName: string) {
  await ensureChildObject(page, objectName);
  await page.goto("/");
  await page.getByTestId("project-card").filter({ hasText: PROJECT_NAME }).click();
  await expect(page.getByTestId("left-sidebar")).toBeVisible();
  await page.getByRole("treeitem", { name: objectName }).click();
  await expect(page.getByRole("heading", { level: 1, name: objectName })).toBeVisible();
  await page.getByTestId("edit-toggle").click();
  await expect(page.getByTestId("page-editor")).toBeVisible();
}

async function addTextBlock(page: Page, text: string) {
  const editors = page.locator('[data-testid="text-editor"] .ProseMirror');
  const before = await editors.count();
  await page.getByRole("button", { name: /add block/i }).first().click();
  await page.getByTestId("add-block-text").click();
  await expect(editors).toHaveCount(before + 1);
  const editor = editors.last();
  await editor.click();
  await page.keyboard.type(text);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
}

test("edit mode writes a text block, auto-saves and renders it in view mode", async ({ page }) => {
  await openEditor(page, "Editor Writes");
  await addTextBlock(page, "The keep is **ancient**.");

  // Exit edit mode — the read-only view renders the markdown.
  await page.getByTestId("edit-toggle").click();
  const view = page.getByTestId("markdown-view").first();
  await expect(view).toContainText("The keep is ancient.");

  // The content is persisted server-side.
  await page.reload();
  await expect(page.getByTestId("markdown-view").first()).toContainText("The keep is ancient.");
});

test("typing [[ suggests objects and inserts a wiki link", async ({ page }) => {
  await ensureChildObject(page, WIKI_TARGET);
  await openEditor(page, "Editor Wiki");

  await addTextBlock(page, "Visit ");

  const editor = page.locator('[data-testid="text-editor"] .ProseMirror').last();
  await editor.click();
  await page.keyboard.type("[[Tower");

  await expect(page.getByTestId("wiki-suggest")).toBeVisible();
  await page.getByRole("option", { name: WIKI_TARGET }).click();

  await expect(editor).toContainText(`[[${WIKI_TARGET}]]`);
  await expect(page.getByTestId("save-status")).toContainText("Saved");

  // The wiki token survives the round trip into the view.
  await page.getByTestId("edit-toggle").click();
  await expect(page.getByTestId("wiki-chip").first()).toContainText(WIKI_TARGET);
});

test("block actions duplicate, move and delete blocks", async ({ page }) => {
  await openEditor(page, "Editor Actions");

  await addTextBlock(page, "First block");
  await addTextBlock(page, "Second block");
  await expect(page.getByTestId("editable-block")).toHaveCount(2);

  // Move the last block up.
  const lastBlock = page.getByTestId("editable-block").nth(1);
  await lastBlock.hover();
  await lastBlock.getByLabel("Move up").click();
  await expect(page.locator('[data-testid="text-editor"] .ProseMirror').first()).toContainText("Second block");

  // Duplicate the first block.
  const firstBlock = page.getByTestId("editable-block").first();
  await firstBlock.hover();
  await firstBlock.getByLabel("Duplicate block").click();
  await expect(page.getByTestId("editable-block")).toHaveCount(3);

  // Delete the last block.
  const lastAfterDuplicate = page.getByTestId("editable-block").last();
  await lastAfterDuplicate.hover();
  await lastAfterDuplicate.getByLabel("Delete block").click();
  await expect(page.getByTestId("editable-block")).toHaveCount(2);
});