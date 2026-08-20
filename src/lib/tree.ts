import type { GameObject, GameObjectTreeNode } from "@/api/types";

/** Build a nested tree from a flat list of GameObjects ordered by parentId/sortOrder. */
export function buildTree(nodes: readonly GameObject[]): GameObjectTreeNode[] {
  const byId = new Map<string, GameObjectTreeNode>();
  const roots: GameObjectTreeNode[] = [];

  for (const node of nodes) {
    byId.set(node.id, { ...node, children: [] });
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sort = (list: GameObjectTreeNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const item of list) sort(item.children);
  };
  sort(roots);

  return roots;
}

/** Depth-first flatten of a nested tree (stable order). */
export function flattenTree(nodes: readonly GameObjectTreeNode[]): GameObject[] {
  const out: GameObject[] = [];
  const visit = (node: GameObjectTreeNode) => {
    out.push({ ...node, children: undefined } as unknown as GameObject);
    for (const child of node.children) visit(child);
  };
  for (const node of nodes) visit(node);
  return out;
}

export function findNode(
  nodes: readonly GameObjectTreeNode[],
  id: string,
): GameObjectTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return undefined;
}

/** All descendant ids (excluding the node itself) — used for cascade-aware UI. */
export function collectDescendantIds(nodes: readonly GameObjectTreeNode[], id: string): string[] {
  const node = findNode(nodes, id);
  if (!node) return [];
  return flattenTree(node.children).map((n) => n.id);
}

/** Path from root to the given node. Returns [] if not found. */
export function ancestorPath(nodes: readonly GameObjectTreeNode[], id: string): GameObjectTreeNode[] {
  for (const node of nodes) {
    if (node.id === id) return [node];
    const childPath = ancestorPath(node.children, id);
    if (childPath.length > 0) return [node, ...childPath];
  }
  return [];
}

/** Sorted children of a flat list for a given parent id. */
export function childrenOf(nodes: readonly GameObject[], parentId: string | null): GameObject[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Prune a tree to the nodes that satisfy `predicate`, keeping their ancestor
 * chain. A node is kept when it (or any descendant) matches; non-matching
 * subtrees of a matching node are dropped.
 */
export function filterTree(
  nodes: readonly GameObjectTreeNode[],
  predicate: (node: GameObjectTreeNode) => boolean,
): GameObjectTreeNode[] {
  const prune = (node: GameObjectTreeNode): GameObjectTreeNode | null => {
    const children = node.children.map(prune).filter((n): n is GameObjectTreeNode => n !== null);
    if (predicate(node) || children.length > 0) {
      return { ...node, children };
    }
    return null;
  };
  return nodes.map(prune).filter((n): n is GameObjectTreeNode => n !== null);
}