# Backend gaps — to implement

Frontend feature batch `feature/ux-polish-etap1` contains UI that depends on
backend endpoints that **do not exist yet**. Per the batch rules these are not
silently hidden: every caller is marked with `TODO(backend):` and gracefully
degrades (session-only state + a `console.warn`). Once the endpoints below land,
the existing frontend code works with **no UI changes** — it already calls these
URLs via `src/api/endpoints.ts`.

API style conventions to follow (mirror the existing contract in `docs/API.md`):

- All ids are UUIDv4; errors are Problem Details (`{ code, messageKey, ... }`).
- Mutation responses match the existing entity shapes (see each section).
- New error codes belong in `locales/*/errors.json`.

---

## 1. Update a project — `PATCH /api/v1/projects/:projectId`

Driven by the **Settings** dialog (`src/features/projects/SettingsDialog.tsx`) and
project rename (`src/features/projects/ProjectListPage.tsx`).

Body (all fields optional): `{ name?, description?, bannerAssetId? }`

- `name`: string (min 1) — renames the project.
- `description`: string | null — clears when `null`.
- `bannerAssetId`: uuid | null — project banner; must reference an asset of the
  same project (404/400 otherwise).

Returns 200: Project entity (the same shape as `GET /projects/:id`).

Invalidate: the frontend re-fetches `GET /projects` after a successful update.

---

## 2. Update a GameObject — `POST /api/v1/projects/:projectId/game-objects/:goId/update`

Driven by the GO icon picker and the banner picker
(`src/features/object/ObjectView.tsx`).

Body (all fields optional): `{ name?, icon?, bannerAssetId? }`

- `name`: string (min 1) — renames the object (keeps `parentId`/`sortOrder`).
- `icon`: string | null — one of the presets in `src/api/types.ts` (`OBJECT_ICONS`).
- `bannerAssetId`: uuid | null — GO banner; must belong to the same project.

Returns 200/201: GameObject entity.

Requires the **new field** `bannerAssetId: string | null` on the GameObject
entity (the frontend type already carries it as optional, see
`src/api/types.ts`).

Invalidate: `GET /game-objects/tree` and `GET /game-objects`.

---

## 3. Move / reorder a GameObject — `POST /api/v1/projects/:projectId/game-objects/:goId/move`

Driven by hierarchy drag & drop (`src/features/tree/TreeView.tsx`):
reorder within a parent, make a child (`parentId = target`), or pull out to the
root (`parentId = null`).

Body: `{ parentId?: uuid | null, toIndex: number (>= 0) }`

- `parentId` — new parent (or `null` for root). Must not create a cycle
  (cannot move a node under itself or its own descendant → 400/409).
- `toIndex` — the final 0-based position within the new parent's child list.

Returns 200/201: `GameObject[]` (the whole tree order after the move, matching
`GET /game-objects` semantics) or the affected parent's children.

---

## 4. Pages — create / rename / delete / reorder

Pages are currently **read-only** on the backend (`GET .../pages`); the `Main`
page is auto-created with each GameObject. The frontend page manager
(`src/features/object/ObjectView.tsx`) and the tree's "Create child" flow need
the full page lifecycle:

### 4a. Create — `POST /api/v1/projects/:projectId/game-objects/:goId/pages`
Body: `{ title: string (min 1) }`. Returns 201: Page entity.
Append at the end (`sortOrder = max + 1`). The auto-created `Main` page keeps
`sortOrder = 0`.

### 4b. Rename — `POST /api/v1/projects/:projectId/game-objects/:goId/pages/:pageId/update`
Body: `{ title: string (min 1) }`. Returns 200/201: Page entity. 404 `PAGE_NOT_FOUND`.

### 4c. Delete — `POST /api/v1/projects/:projectId/game-objects/:goId/pages/:pageId/delete`
Returns 200: `{ success: true }`. Cascades: deletes the page's blocks (+
references/search rows). Guard: cannot delete the last remaining page (409),
because every GameObject must keep at least its `Main` page.

### 4d. Reorder — `POST /api/v1/projects/:projectId/game-objects/:goId/pages/:pageId/move`
Body: `{ toIndex: number (>= 0) }`. Returns 200/201: `Page[]` (page order after
the move). 404 `PAGE_NOT_FOUND`.

---

## 5. Search index — include names and titles

`GET /api/v1/projects/:projectId/search` is documented to cover "text blocks,
game object names, page titles", but in practice only block content is indexed.
The frontend compensates client-side (`src/features/search/CommandPalette.tsx`)
by matching GO names (from the tree) and page titles (from `.../pages`).

Please index `GameObject.name` and `Page.title` server-side so server results
are complete and ranked. Frontend keeps the client-side fallback (it dedupes
against server results, so the two compose cleanly).

---

## Notes for the frontend caller (current behaviour until backend lands)

- Mutations call the endpoints above and `console.warn` on failure; UI state
  (tree draft in `TreeView`, object visuals in `stores/objectVisualsStore.ts`)
  keeps working for the current session so interactions feel responsive.
- Nothing is persisted to `localStorage` — the server remains the source of truth.