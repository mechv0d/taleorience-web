import { api, apiUrl } from "./client";
import type {
  Asset,
  AssetFolder,
  Backlink,
  Block,
  BlockInput,
  GameObject,
  GameObjectTreeNode,
  Page,
  Project,
  Relation,
  SearchResult,
  SuccessResponse,
  Tag,
} from "./types";

/**
 * Typed API endpoints. Every URL here exists in docs/API.md — do not invent endpoints.
 * Note: the backend contract evolves (v0.4.0+); new read endpoints (game-objects list/tree)
 * are already part of the contract.
 */

/* ------------------------------- Projects ------------------------------- */

export const listProjects = () => api.request<Project[]>("/projects");

export const getProject = (projectId: string) => api.request<Project>(`/projects/${projectId}`);

export const createProject = (input: { name: string; description?: string }) =>
  api.request<Project>("/projects", { method: "POST", body: input });

export const deleteProject = (projectId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}`, { method: "DELETE" });

/* ---------------------------- Game objects ------------------------------ */

export const listGameObjects = (projectId: string) =>
  api.request<GameObject[]>(`/projects/${projectId}/game-objects`);

export const getGameObjectTree = (projectId: string) =>
  api.request<GameObjectTreeNode[]>(`/projects/${projectId}/game-objects/tree`);

export const createGameObject = (
  projectId: string,
  input: { name: string; parentId?: string | null },
) => api.request<GameObject>(`/projects/${projectId}/game-objects`, { method: "POST", body: input });

export const deleteGameObject = (projectId: string, gameObjectId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}/game-objects/${gameObjectId}/delete`, {
    method: "POST",
  });

export const getPages = (projectId: string, gameObjectId: string) =>
  api.request<Page[]>(`/projects/${projectId}/game-objects/${gameObjectId}/pages`);

/* -------------------------------- Blocks -------------------------------- */

export const listBlocks = (projectId: string, pageId: string) =>
  api.request<Block[]>(`/projects/${projectId}/pages/${pageId}/blocks`);

export const createBlock = <T extends Block["type"]>(
  projectId: string,
  pageId: string,
  input: BlockInput<T>,
) => api.request<Block<T>>(`/projects/${projectId}/pages/${pageId}/blocks`, { method: "POST", body: input });

export const getBlock = <T extends Block["type"] = Block["type"]>(projectId: string, blockId: string) =>
  api.request<Block<T>>(`/projects/${projectId}/blocks/${blockId}`);

export const updateBlock = (projectId: string, blockId: string, data: Block["data"]) =>
  api.request<Block>(`/projects/${projectId}/blocks/${blockId}/update`, { method: "POST", body: { data } });

export const deleteBlock = (projectId: string, blockId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}/blocks/${blockId}`, { method: "DELETE" });

export const moveBlock = (projectId: string, blockId: string, toIndex: number) =>
  api.request<Block[]>(`/projects/${projectId}/blocks/${blockId}/move`, {
    method: "POST",
    body: { toIndex },
  });

export const duplicateBlock = (projectId: string, blockId: string, toIndex?: number) =>
  api.request<Block>(`/projects/${projectId}/blocks/${blockId}/duplicate`, {
    method: "POST",
    body: toIndex === undefined ? {} : { toIndex },
  });

/* --------------------------------- Tags --------------------------------- */

export const listTags = (projectId: string) => api.request<Tag[]>(`/projects/${projectId}/tags`);

export const createTag = (projectId: string, name: string) =>
  api.request<Tag>(`/projects/${projectId}/tags`, { method: "POST", body: { name } });

export const deleteTag = (projectId: string, tagId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}/tags/${tagId}`, { method: "DELETE" });

export const listGameObjectTags = (projectId: string, gameObjectId: string) =>
  api.request<Tag[]>(`/projects/${projectId}/game-objects/${gameObjectId}/tags`);

export const addTagToGameObject = (projectId: string, gameObjectId: string, name: string) =>
  api.request<unknown>(`/projects/${projectId}/game-objects/${gameObjectId}/tags`, {
    method: "POST",
    body: { name },
  });

export const removeTagFromGameObject = (projectId: string, gameObjectId: string, tagId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}/game-objects/${gameObjectId}/tags/${tagId}`, {
    method: "DELETE",
  });

/* ------------------------------- Relations ------------------------------ */

export const createRelation = (
  projectId: string,
  gameObjectId: string,
  input: { targetGameObjectId: string; type: string },
) =>
  api.request<Relation>(`/projects/${projectId}/game-objects/${gameObjectId}/relations`, {
    method: "POST",
    body: input,
  });

export const listRelations = (projectId: string) =>
  api.request<Relation[]>(`/projects/${projectId}/relations`);

export const deleteRelation = (projectId: string, relationId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}/relations/${relationId}`, {
    method: "DELETE",
  });

/* ------------------------- References and search ------------------------ */

export const getBacklinks = (projectId: string, gameObjectId: string) =>
  api.request<Backlink[]>(`/projects/${projectId}/game-objects/${gameObjectId}/backlinks`);

export const resolveReferences = (projectId: string, query: string, limit = 10) =>
  api.request<GameObject[]>(`/projects/${projectId}/references/resolve`, {
    query: { q: query, limit },
  });

export const searchProject = (projectId: string, query: string, limit = 30) =>
  api.request<SearchResult[]>(`/projects/${projectId}/search`, { query: { q: query, limit } });

/* -------------------------------- Assets -------------------------------- */

export const listAssets = (projectId: string) => api.request<Asset[]>(`/projects/${projectId}/assets`);

export const uploadAsset = (projectId: string, file: Blob, folderId?: string) => {
  const form = new FormData();
  form.append("file", file, file instanceof File ? file.name : "upload");
  if (folderId) form.append("folderId", folderId);
  return api.request<Asset>(`/projects/${projectId}/assets`, { method: "POST", body: form });
};

export const getAsset = (projectId: string, assetId: string) =>
  api.request<Asset>(`/projects/${projectId}/assets/${assetId}`);

export const updateAsset = (
  projectId: string,
  assetId: string,
  input: { folderId?: string | null; metadata?: Record<string, unknown> },
) => api.request<Asset>(`/projects/${projectId}/assets/${assetId}`, { method: "PATCH", body: input });

export const deleteAsset = (projectId: string, assetId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}/assets/${assetId}`, { method: "DELETE" });

export const assetContentUrl = (projectId: string, assetId: string) =>
  apiUrl(`/projects/${projectId}/assets/${assetId}/content`);

export const assetThumbnailUrl = (projectId: string, assetId: string) =>
  apiUrl(`/projects/${projectId}/assets/${assetId}/thumbnail`);

/* ----------------------------- Asset folders ---------------------------- */

export const listAssetFolders = (projectId: string) =>
  api.request<AssetFolder[]>(`/projects/${projectId}/asset-folders`);

export const createAssetFolder = (projectId: string, input: { name: string; parentId?: string | null }) =>
  api.request<AssetFolder>(`/projects/${projectId}/asset-folders`, { method: "POST", body: input });

export const deleteAssetFolder = (projectId: string, folderId: string) =>
  api.request<SuccessResponse>(`/projects/${projectId}/asset-folders/${folderId}`, { method: "DELETE" });