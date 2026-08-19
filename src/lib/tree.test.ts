import { describe, expect, it } from "vitest";

import { buildTree, collectDescendantIds, flattenTree, ancestorPath, childrenOf, findNode } from "./tree";
import type { GameObject } from "@/api/types";

function go(partial: Partial<GameObject>): GameObject {
  return {
    id: partial.id!,
    projectId: "proj",
    parentId: partial.parentId ?? null,
    name: partial.name ?? partial.id!,
    icon: null,
    sortOrder: partial.sortOrder ?? 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("buildTree", () => {
  it("builds a nested hierarchy from a flat parentId list", () => {
    const flat = [
      go({ id: "root", sortOrder: 1 }),
      go({ id: "a", parentId: "root", sortOrder: 0 }),
      go({ id: "b", parentId: "root", sortOrder: 1 }),
      go({ id: "a1", parentId: "a", sortOrder: 0 }),
    ];
    const tree = buildTree(flat);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("root");
    expect(tree[0].children.map((c) => c.id)).toEqual(["a", "b"]);
    expect(tree[0].children[0].children.map((c) => c.id)).toEqual(["a1"]);
  });

  it("orders siblings by sortOrder", () => {
    const flat = [go({ id: "b", sortOrder: 2 }), go({ id: "a", sortOrder: 1 })];
    const tree = buildTree(flat);
    expect(tree.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("promotes nodes whose parent is missing to roots", () => {
    const flat = [go({ id: "a", parentId: "missing" }), go({ id: "root" })];
    const tree = buildTree(flat);
    expect(tree.map((n) => n.id).sort()).toEqual(["a", "root"]);
  });
});

describe("flattenTree", () => {
  it("returns depth-first order", () => {
    const tree = buildTree([
      go({ id: "root" }),
      go({ id: "a", parentId: "root" }),
      go({ id: "a1", parentId: "a" }),
      go({ id: "b", parentId: "root" }),
    ]);
    expect(flattenTree(tree).map((n) => n.id)).toEqual(["root", "a", "a1", "b"]);
  });
});

describe("findNode / ancestorPath / collectDescendantIds", () => {
  const tree = buildTree([
    go({ id: "root" }),
    go({ id: "a", parentId: "root" }),
    go({ id: "a1", parentId: "a" }),
    go({ id: "a2", parentId: "a" }),
    go({ id: "b", parentId: "root" }),
  ]);

  it("finds a node by id", () => {
    expect(findNode(tree, "a1")?.name).toBe("a1");
    expect(findNode(tree, "zzz")).toBeUndefined();
  });

  it("computes ancestor path root→node", () => {
    expect(ancestorPath(tree, "a1").map((n) => n.id)).toEqual(["root", "a", "a1"]);
    expect(ancestorPath(tree, "root").map((n) => n.id)).toEqual(["root"]);
    expect(ancestorPath(tree, "zzz")).toEqual([]);
  });

  it("collects descendant ids (excluding self)", () => {
    expect(collectDescendantIds(tree, "a").sort()).toEqual(["a1", "a2"]);
    expect(collectDescendantIds(tree, "a1")).toEqual([]);
  });
});

describe("childrenOf", () => {
  it("filters and sorts by parent + sortOrder", () => {
    const flat = [
      go({ id: "b", parentId: "root", sortOrder: 2 }),
      go({ id: "a", parentId: "root", sortOrder: 1 }),
      go({ id: "orphan" }),
    ];
    expect(childrenOf(flat, "root").map((n) => n.id)).toEqual(["a", "b"]);
    expect(childrenOf(flat, null).map((n) => n.id)).toEqual(["orphan"]);
  });
});