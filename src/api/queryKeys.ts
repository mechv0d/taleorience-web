/** TanStack Query key factory — single source of truth for cache keys. */
export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    detail: (projectId: string) => ["projects", projectId] as const,
  },
  gameObjects: {
    tree: (projectId: string) => ["projects", projectId, "game-objects", "tree"] as const,
    list: (projectId: string) => ["projects", projectId, "game-objects"] as const,
    pages: (projectId: string, gameObjectId: string) =>
      ["projects", projectId, "game-objects", gameObjectId, "pages"] as const,
  },
  blocks: {
    list: (projectId: string, pageId: string) => ["projects", projectId, "pages", pageId, "blocks"] as const,
    detail: (projectId: string, blockId: string) => ["projects", projectId, "blocks", blockId] as const,
  },
  tags: {
    all: (projectId: string) => ["projects", projectId, "tags"] as const,
    forObject: (projectId: string, gameObjectId: string) =>
      ["projects", projectId, "game-objects", gameObjectId, "tags"] as const,
  },
  relations: {
    all: (projectId: string) => ["projects", projectId, "relations"] as const,
  },
  backlinks: {
    forObject: (projectId: string, gameObjectId: string) =>
      ["projects", projectId, "game-objects", gameObjectId, "backlinks"] as const,
  },
  search: {
    query: (projectId: string, query: string) => ["projects", projectId, "search", query] as const,
  },
  references: {
    resolve: (projectId: string, query: string) => ["projects", projectId, "references", "resolve", query] as const,
  },
  assets: {
    all: (projectId: string) => ["projects", projectId, "assets"] as const,
    detail: (projectId: string, assetId: string) => ["projects", projectId, "assets", assetId] as const,
    folders: (projectId: string) => ["projects", projectId, "asset-folders"] as const,
  },
} as const;