/**
 * Domain entities as returned by the TaleOrience API v0.4.0.
 * See docs/API.md for the exact HTTP contract.
 */

export interface Project {
  id: string;
  name: string;
  description: string | null;
  bannerAssetId: string | null;
  isExample: boolean;
  isReadOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameObject {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameObjectTreeNode extends GameObject {
  children: GameObjectTreeNode[];
}

export interface Page {
  id: string;
  projectId: string;
  gameObjectId: string;
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const BLOCK_TYPES = [
  "text",
  "image",
  "gallery",
  "quote",
  "callout",
  "divider",
  "table",
  "embed",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface TextBlockData {
  content: string;
}

export interface ImageBlockData {
  assetId: string;
  caption?: string;
}

export interface GalleryBlockData {
  assetIds: string[];
}

export interface QuoteBlockData {
  content: string;
  attribution?: string;
}

export interface CalloutBlockData {
  content: string;
  emoji?: string;
}

export type DividerBlockData = Record<string, never>;

export interface TableBlockData {
  headers?: string[];
  rows: string[][];
}

export interface EmbedBlockData {
  url: string;
  caption?: string;
}

export interface BlockDataMap {
  text: TextBlockData;
  image: ImageBlockData;
  gallery: GalleryBlockData;
  quote: QuoteBlockData;
  callout: CalloutBlockData;
  divider: DividerBlockData;
  table: TableBlockData;
  embed: EmbedBlockData;
}

interface BlockBase<T extends BlockType> {
  id: string;
  projectId: string;
  pageId: string;
  type: T;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type Block<T extends BlockType = BlockType> = BlockBase<T> & {
  data: BlockDataMap[T];
};

export type BlockInput<T extends BlockType = BlockType> = {
  type: T;
  data: BlockDataMap[T];
};

export interface Tag {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Relation {
  id: string;
  projectId: string;
  sourceGameObjectId: string;
  targetGameObjectId: string;
  type: string;
  createdAt: string;
}

export interface Backlink {
  referenceId: string;
  blockId: string;
  pageId: string;
  pageTitle: string;
  label: string | null;
}

export type SearchEntityType = "gameObject" | "page" | "block";

export interface SearchResult {
  id: string;
  projectId: string;
  entityType: SearchEntityType;
  entityId: string;
  text: string;
}

export interface Asset {
  id: string;
  projectId: string;
  folderId: string | null;
  type: string;
  path: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  metadata: Record<string, unknown>;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetFolder {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuccessResponse {
  success: boolean;
}

/** Problem Details error payload (docs/API.md §8). */
export interface ProblemDetails {
  code: string;
  messageKey: string;
  params?: Record<string, unknown>;
  path: string;
  timestamp: string;
}