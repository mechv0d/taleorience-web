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

/** Local, session-scoped tree edits (used by the hierarchy drag & drop). */
export interface TreeDraft {
  /** Overridden parent per node id (key absent = use server value). */
  parentOf: Record<string, string | null>;
  /** Preferred child order per parent (key = parentId, or "__root__"). */
  order: Record<string, string[]>;
}

const ROOT_KEY = "__root__";

export const emptyDraft = (): TreeDraft => ({ parentOf: {}, order: {} });

export function parentKeyOf(parentId: string | null): string {
  return parentId ?? ROOT_KEY;
}

/**
 * Rebuild the tree applying a TreeDraft on top of the server tree: nodes get
 * their overridden parent and each parent's children keep the draft order.
 */
export function buildDraftTree(
  nodes: readonly GameObjectTreeNode[],
  draft: TreeDraft,
): GameObjectTreeNode[] {
  const flat = flattenTree(nodes).map((n) => ({
    ...n,
    parentId: draft.parentOf[n.id] !== undefined ? draft.parentOf[n.id] : n.parentId,
  }));

  const byId = new Map<string, GameObjectTreeNode>();
  for (const n of flat) byId.set(n.id, { ...n, children: [] });

  const orderFor = <T extends GameObject>(parentId: string | null, list: T[]): T[] => {
    const order = draft.order[parentKeyOf(parentId)];
    if (!order) return list;
    const map = new Map(list.map((n) => [n.id, n]));
    const ordered = order.filter((id) => map.has(id)).map((id) => map.get(id)!);
    const rest = list.filter((n) => !order.includes(n.id)).sort((a, b) => a.sortOrder - b.sortOrder);
    return [...ordered, ...rest];
  };

  const roots: GameObjectTreeNode[] = [];
  for (const n of byId.values()) {
    if (n.parentId && byId.has(n.parentId)) byId.get(n.parentId)!.children.push(n);
    else roots.push(n);
  }

  const sortRecursive = (list: GameObjectTreeNode[]) => {
    for (const item of list) {
      item.children = orderFor(item.id, item.children);
      sortRecursive(item.children);
    }
  };
  sortRecursive(roots);

  return orderFor(null, roots);
}

/**
 * Compute the target parent and resulting child order for a drag & drop move.
 * `flat` is the current flattened tree (draft applied).
 */
export function computeMove(
  flat: readonly GameObject[],
  draggedId: string,
  targetId: string,
  position: "before" | "after" | "inside",
): { parentId: string | null; order: string[] } {
  const dragged = flat.find((n) => n.id === draggedId)!;
  const target = flat.find((n) => n.id === targetId)!;
  const withoutDragged = flat.filter((n) => n.id !== draggedId);

  let parentId: string | null;
  let siblings: GameObject[];

  if (position === "inside") {
    parentId = target.id;
    siblings = [...withoutDragged.filter((n) => n.parentId === target.id), dragged];
  } else {
    parentId = target.parentId ?? null;
    siblings = withoutDragged.filter((n) => (n.parentId ?? null) === parentId);
    const targetIndex = siblings.findIndex((n) => n.id === targetId);
    const insertAt = position === "before" ? targetIndex : targetIndex + 1;
    siblings = [...siblings.slice(0, insertAt), dragged, ...siblings.slice(insertAt)];
  }

  return { parentId, order: siblings.map((n) => n.id) };
}