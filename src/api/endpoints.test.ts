import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./client";
import {
  assetThumbnailUrl,
  createBlock,
  createGameObject,
  createTag,
  deleteBlock,
  getPages,
  listGameObjects,
  moveBlock,
  resolveReferences,
  searchProject,
  updateBlock,
  uploadAsset,
} from "./endpoints";

type Captured = { url: string; init: RequestInit };

let captured: Captured[] = [];

function mockFetchReturn(status: number, body: unknown) {
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    captured.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
}

beforeEach(() => {
  captured = [];
  api.setFetchImpl(mockFetchReturn(200, []));
});

afterEach(() => {
  api.setFetchImpl(fetch.bind(globalThis));
});

describe("endpoints", () => {
  it("listGameObjects GETs the tree source with no body", async () => {
    api.setFetchImpl(mockFetchReturn(200, []));
    await listGameObjects("p1");
    expect(captured[0].url).toBe("/api/v1/projects/p1/game-objects");
    expect(captured[0].init.method).toBe("GET");
  });

  it("createGameObject POSTs name and parentId", async () => {
    api.setFetchImpl(mockFetchReturn(201, { id: "go" }));
    await createGameObject("p1", { name: "Citadel", parentId: "root" });
    expect(captured[0].url).toBe("/api/v1/projects/p1/game-objects");
    expect(JSON.parse(String(captured[0].init.body))).toEqual({ name: "Citadel", parentId: "root" });
  });

  it("listPages hits the per-object pages endpoint", async () => {
    api.setFetchImpl(mockFetchReturn(200, []));
    await getPages("p1", "go1");
    expect(captured[0].url).toBe("/api/v1/projects/p1/game-objects/go1/pages");
  });

  it("createBlock POSTs type + data to the page endpoint", async () => {
    api.setFetchImpl(mockFetchReturn(201, { id: "b" }));
    await createBlock("p1", "pg1", { type: "quote", data: { content: "hi", attribution: "me" } });
    expect(captured[0].url).toBe("/api/v1/projects/p1/pages/pg1/blocks");
    expect(JSON.parse(String(captured[0].init.body))).toEqual({
      type: "quote",
      data: { content: "hi", attribution: "me" },
    });
  });

  it("updateBlock POSTs { data } to the update endpoint", async () => {
    api.setFetchImpl(mockFetchReturn(201, { id: "b" }));
    await updateBlock("p1", "b1", { content: "new" });
    expect(captured[0].url).toBe("/api/v1/projects/p1/blocks/b1/update");
    expect(JSON.parse(String(captured[0].init.body))).toEqual({ data: { content: "new" } });
  });

  it("moveBlock POSTs toIndex", async () => {
    api.setFetchImpl(mockFetchReturn(201, []));
    await moveBlock("p1", "b1", 3);
    expect(JSON.parse(String(captured[0].init.body))).toEqual({ toIndex: 3 });
  });

  it("deleteBlock issues DELETE", async () => {
    api.setFetchImpl(mockFetchReturn(200, { success: true }));
    await deleteBlock("p1", "b1");
    expect(captured[0].init.method).toBe("DELETE");
  });

  it("createTag POSTs { name }", async () => {
    api.setFetchImpl(mockFetchReturn(201, { id: "t" }));
    await createTag("p1", "architecture");
    expect(JSON.parse(String(captured[0].init.body))).toEqual({ name: "architecture" });
  });

  it("resolveReferences sends q and limit", async () => {
    api.setFetchImpl(mockFetchReturn(200, []));
    await resolveReferences("p1", "moon", 7);
    expect(captured[0].url).toBe("/api/v1/projects/p1/references/resolve?q=moon&limit=7");
  });

  it("searchProject sends q and default limit", async () => {
    api.setFetchImpl(mockFetchReturn(200, []));
    await searchProject("p1", "citadel");
    expect(captured[0].url).toBe("/api/v1/projects/p1/search?q=citadel&limit=30");
  });

  it("uploadAsset sends multipart FormData", async () => {
    api.setFetchImpl(mockFetchReturn(201, { id: "a" }));
    const file = new File(["img"], "pic.png", { type: "image/png" });
    await uploadAsset("p1", file, "f1");
    expect(captured[0].url).toBe("/api/v1/projects/p1/assets");
    const body = captured[0].init.body;
    expect(body).toBeInstanceOf(FormData);
    const form = body as FormData;
    expect(form.get("folderId")).toBe("f1");
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("assetThumbnailUrl resolves against the base url", () => {
    expect(assetThumbnailUrl("p1", "a1")).toBe("/api/v1/projects/p1/assets/a1/thumbnail");
  });
});
