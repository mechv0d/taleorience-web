import { describe, expect, it } from "vitest";

import type { GameObjectTreeNode } from "@/api/types";
import { filterTree } from "./tree";

const n = (id: string, children: GameObjectTreeNode[] = []): GameObjectTreeNode =>
  ({
    id,
    projectId: "p",
    parentId: null,
    name: id,
    icon: null,
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
    children,
  }) as GameObjectTreeNode;

describe("filterTree", () => {
  const tree = [
    n("root", [
      n("citadel", [n("quest", [n("part1"), n("part2")])]),
      n("port"),
      n("house"),
    ]),
  ];

  it("keeps matching nodes with their ancestors and matching subtrees", () => {
    const result = filterTree(tree, (node) => node.id === "quest");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("root");
    expect(result[0].children[0].id).toBe("citadel");
    expect(result[0].children[0].children).toHaveLength(1);
    expect(result[0].children[0].children[0].id).toBe("quest");
    // Non-matching siblings of matching subtree are dropped.
    expect(result[0].children).toHaveLength(1);
  });

  it("keeps direct matches and drops non-matching children", () => {
    const result = filterTree(tree, (node) => node.id === "port");
    expect(result[0].children[0].id).toBe("port");
    expect(result[0].children[0].children).toEqual([]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTree(tree, () => false)).toEqual([]);
  });

  it("keeps everything when the predicate always matches", () => {
    const result = filterTree(tree, () => true);
    expect(result[0].children.map((c) => c.id)).toEqual(["citadel", "port", "house"]);
  });
});