import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  addTagToGameObject,
  createAssetFolder,
  createBlock,
  createGameObject,
  createPage,
  createProject,
  createRelation,
  createTag,
  deleteAsset,
  deleteAssetFolder,
  deleteBlock,
  deleteGameObject,
  deletePage,
  deleteProject,
  deleteRelation,
  deleteTag,
  duplicateBlock,
  getBacklinks,
  getGameObjectTree,
  getPages,
  listAssets,
  listAssetFolders,
  listBlocks,
  listGameObjectTags,
  listProjects,
  listRelations,
  listTags,
  moveBlock,
  moveGameObject,
  movePage,
  removeTagFromGameObject,
  resolveReferences,
  searchProject,
  updateBlock,
  updateGameObject,
  updatePage,
  updateProject,
  uploadAsset,
} from "./endpoints";
import { queryKeys } from "./queryKeys";
import type { Asset, AssetFolder, Backlink, Block, BlockInput, GameObject, Page, Project, Relation, Tag } from "./types";

/* ------------------------------- Projects ------------------------------- */

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects.all, queryFn: listProjects });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ""),
    queryFn: () => listProjects().then((projects) => projects.find((p) => p.id === projectId)),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject(): UseMutationResult<Project, Error, { name: string; description?: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

export function useDeleteProject(): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

/* --------------- Pending backend (see backend-should-implement.md) ---------------- */

// TODO(backend): needs `PATCH /projects/:projectId` — see backend-should-implement.md.
export function useUpdateProject(): UseMutationResult<
  Project,
  Error,
  { projectId: string; input: Parameters<typeof updateProject>[1] }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }) => updateProject(projectId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
    },
  });
}

// TODO(backend): needs `POST /game-objects/:goId/update` — see backend-should-implement.md.
export function useUpdateGameObject(): UseMutationResult<
  GameObject,
  Error,
  { projectId: string; gameObjectId: string; input: Parameters<typeof updateGameObject>[2] }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, input }) => updateGameObject(projectId, gameObjectId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.tree(variables.projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.list(variables.projectId) });
    },
  });
}

// TODO(backend): needs `POST /game-objects/:goId/move` — see backend-should-implement.md.
export function useMoveGameObject(): UseMutationResult<
  GameObject[],
  Error,
  { projectId: string; gameObjectId: string; parentId?: string | null; toIndex: number }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, parentId, toIndex }) =>
      moveGameObject(projectId, gameObjectId, { parentId, toIndex }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.tree(variables.projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.list(variables.projectId) });
    },
  });
}

// TODO(backend): needs `POST /game-objects/:goId/pages` — see backend-should-implement.md.
export function useCreatePage(): UseMutationResult<
  Page,
  Error,
  { projectId: string; gameObjectId: string; title: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, title }) => createPage(projectId, gameObjectId, { title }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gameObjects.pages(variables.projectId, variables.gameObjectId),
      });
    },
  });
}

// TODO(backend): needs `POST /game-objects/:goId/pages/:pageId/update` — see backend-should-implement.md.
export function useUpdatePage(): UseMutationResult<
  Page,
  Error,
  { projectId: string; gameObjectId: string; pageId: string; title: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, pageId, title }) =>
      updatePage(projectId, gameObjectId, pageId, { title }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gameObjects.pages(variables.projectId, variables.gameObjectId),
      });
    },
  });
}

// TODO(backend): needs `POST /game-objects/:goId/pages/:pageId/delete` — see backend-should-implement.md.
export function useDeletePage(): UseMutationResult<
  unknown,
  Error,
  { projectId: string; gameObjectId: string; pageId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, pageId }) => deletePage(projectId, gameObjectId, pageId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gameObjects.pages(variables.projectId, variables.gameObjectId),
      });
    },
  });
}

// TODO(backend): needs `POST /game-objects/:goId/pages/:pageId/move` — see backend-should-implement.md.
export function useMovePage(): UseMutationResult<
  Page[],
  Error,
  { projectId: string; gameObjectId: string; pageId: string; toIndex: number }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, pageId, toIndex }) =>
      movePage(projectId, gameObjectId, pageId, toIndex),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gameObjects.pages(variables.projectId, variables.gameObjectId),
      });
    },
  });
}

/* ---------------------------- Game objects ------------------------------ */

export function useGameObjectTree(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.gameObjects.tree(projectId ?? ""),
    queryFn: () => getGameObjectTree(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useCreateGameObject(): UseMutationResult<
  GameObject,
  Error,
  { projectId: string; name: string; parentId?: string | null }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, name, parentId }) => createGameObject(projectId, { name, parentId }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.tree(variables.projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.list(variables.projectId) });
    },
  });
}

export function useDeleteGameObject(): UseMutationResult<
  unknown,
  Error,
  { projectId: string; gameObjectId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId }) => deleteGameObject(projectId, gameObjectId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.tree(variables.projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gameObjects.list(variables.projectId) });
    },
  });
}

export function usePages(projectId: string | undefined, gameObjectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.gameObjects.pages(projectId ?? "", gameObjectId ?? ""),
    queryFn: () => getPages(projectId!, gameObjectId!),
    enabled: Boolean(projectId && gameObjectId),
  });
}

/* -------------------------------- Blocks -------------------------------- */

export function useBlocks(projectId: string | undefined, pageId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.blocks.list(projectId ?? "", pageId ?? ""),
    queryFn: () => listBlocks(projectId!, pageId!),
    enabled: Boolean(projectId && pageId),
  });
}

export function useCreateBlock(): UseMutationResult<
  Block,
  Error,
  { projectId: string; pageId: string; input: BlockInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, pageId, input }) => createBlock(projectId, pageId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocks.list(variables.projectId, variables.pageId) });
    },
  });
}

export function useUpdateBlock(): UseMutationResult<
  Block,
  Error,
  { projectId: string; blockId: string; data: Block["data"]; pageId?: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, blockId, data }) => updateBlock(projectId, blockId, data),
    onSuccess: (_data, variables) => {
      if (variables.pageId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.blocks.list(variables.projectId, variables.pageId),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocks.detail(variables.projectId, variables.blockId) });
    },
  });
}

export function useDeleteBlock(): UseMutationResult<
  unknown,
  Error,
  { projectId: string; blockId: string; pageId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, blockId }) => deleteBlock(projectId, blockId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocks.list(variables.projectId, variables.pageId) });
    },
  });
}

export function useMoveBlock(): UseMutationResult<
  Block[],
  Error,
  { projectId: string; blockId: string; toIndex: number; pageId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, blockId, toIndex }) => moveBlock(projectId, blockId, toIndex),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocks.list(variables.projectId, variables.pageId) });
    },
  });
}

export function useDuplicateBlock(): UseMutationResult<
  Block,
  Error,
  { projectId: string; blockId: string; pageId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, blockId }) => duplicateBlock(projectId, blockId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.blocks.list(variables.projectId, variables.pageId) });
    },
  });
}

/* --------------------------------- Tags --------------------------------- */

export function useTags(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tags.all(projectId ?? ""),
    queryFn: () => listTags(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useGameObjectTags(projectId: string | undefined, gameObjectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tags.forObject(projectId ?? "", gameObjectId ?? ""),
    queryFn: () => listGameObjectTags(projectId!, gameObjectId!),
    enabled: Boolean(projectId && gameObjectId),
  });
}

export function useAddTagToObject(): UseMutationResult<
  unknown,
  Error,
  { projectId: string; gameObjectId: string; name: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, name }) => addTagToGameObject(projectId, gameObjectId, name),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tags.forObject(variables.projectId, variables.gameObjectId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(variables.projectId) });
    },
  });
}

export function useRemoveTagFromObject(): UseMutationResult<
  unknown,
  Error,
  { projectId: string; gameObjectId: string; tagId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, tagId }) =>
      removeTagFromGameObject(projectId, gameObjectId, tagId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tags.forObject(variables.projectId, variables.gameObjectId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(variables.projectId) });
    },
  });
}

export function useCreateTag(): UseMutationResult<Tag, Error, { projectId: string; name: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, name }) => createTag(projectId, name),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(variables.projectId) });
    },
  });
}

export function useDeleteTag(): UseMutationResult<unknown, Error, { projectId: string; tagId: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, tagId }) => deleteTag(projectId, tagId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(variables.projectId) });
    },
  });
}

/* ------------------------------- Relations ------------------------------ */

export function useRelations(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.relations.all(projectId ?? ""),
    queryFn: () => listRelations(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useCreateRelation(): UseMutationResult<
  Relation,
  Error,
  { projectId: string; gameObjectId: string; targetGameObjectId: string; type: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, gameObjectId, targetGameObjectId, type }) =>
      createRelation(projectId, gameObjectId, { targetGameObjectId, type }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relations.all(variables.projectId) });
    },
  });
}

export function useDeleteRelation(): UseMutationResult<
  unknown,
  Error,
  { projectId: string; relationId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, relationId }) => deleteRelation(projectId, relationId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.relations.all(variables.projectId) });
    },
  });
}

/* ------------------------------- Backlinks ------------------------------ */

export function useBacklinks(projectId: string | undefined, gameObjectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.backlinks.forObject(projectId ?? "", gameObjectId ?? ""),
    queryFn: () => getBacklinks(projectId!, gameObjectId!),
    enabled: Boolean(projectId && gameObjectId),
  });
}

/* ---------------------------- Search / resolve -------------------------- */

export function useProjectSearch(projectId: string | undefined, query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.query(projectId ?? "", query),
    queryFn: () => searchProject(projectId!, query),
    enabled: Boolean(projectId) && enabled && query.length > 0,
    placeholderData: (previous) => previous,
  });
}

export function useResolveReferences(
  projectId: string | undefined,
  query: string,
  enabled = true,
): UseQueryResult<GameObject[]> {
  return useQuery({
    queryKey: queryKeys.references.resolve(projectId ?? "", query),
    queryFn: () => resolveReferences(projectId!, query),
    enabled: Boolean(projectId) && enabled && query.length > 0,
    placeholderData: (previous) => previous,
  });
}

/* -------------------------------- Assets -------------------------------- */

export function useAssets(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.all(projectId ?? ""),
    queryFn: () => listAssets(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useUploadAsset(): UseMutationResult<
  Asset,
  Error,
  { projectId: string; file: Blob; folderId?: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, file, folderId }) => uploadAsset(projectId, file, folderId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.assets.all(variables.projectId) });
    },
  });
}

export function useDeleteAsset(): UseMutationResult<unknown, Error, { projectId: string; assetId: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, assetId }) => deleteAsset(projectId, assetId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.assets.all(variables.projectId) });
    },
  });
}

export function useAssetFolders(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.folders(projectId ?? ""),
    queryFn: () => listAssetFolders(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useCreateAssetFolder(): UseMutationResult<
  AssetFolder,
  Error,
  { projectId: string; name: string; parentId?: string | null }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, name, parentId }) => createAssetFolder(projectId, { name, parentId }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.assets.folders(variables.projectId) });
    },
  });
}

export function useDeleteAssetFolder(): UseMutationResult<
  unknown,
  Error,
  { projectId: string; folderId: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, folderId }) => deleteAssetFolder(projectId, folderId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.assets.folders(variables.projectId) });
    },
  });
}

export type { Page, Tag, Backlink, Asset, AssetFolder };